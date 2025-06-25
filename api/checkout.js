export default async function handler(req, res) {
  // CORS headers optimizados para Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parsing robusto del body para Vercel
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (parseError) {
        return res.status(400).json({ error: 'Invalid JSON in request body' });
      }
    }

    if (!body) {
      return res.status(400).json({ error: 'Request body is required' });
    }

    const { amount, currency = 'mxn' } = body;
    
    // Validación estricta para evitar errores de Stripe
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }
    
    if (typeof amount !== 'number' || amount <= 0 || !isFinite(amount)) {
      return res.status(400).json({ 
        error: 'Amount must be a positive finite number',
        received: { amount, type: typeof amount }
      });
    }

    // Verificación de variables de entorno en Vercel
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not found in Vercel environment variables');
      return res.status(500).json({ 
        error: 'Payment system not configured in production environment'
      });
    }

    // Log para debugging en Vercel
    console.log(`[${new Date().toISOString()}] Processing payment: ${amount} ${currency}`);

    // Import dinámico optimizado para Vercel serverless
    const Stripe = (await import('stripe')).default;
    
    // Inicialización de Stripe con configuración para producción
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      typescript: false, // Mejor compatibilidad en Vercel
    });

    // Configuración mínima y estable para Vercel
    const paymentIntentParams = {
      amount: Math.round(amount), // Asegura que sea entero
      currency: currency.toLowerCase(),
      payment_method_types: ['card'],
      automatic_payment_methods: {
        enabled: false
      }
    };

    console.log(`[${new Date().toISOString()}] Creating Stripe payment intent`);

    // Crear payment intent con timeout para Vercel
    const paymentIntent = await Promise.race([
      stripe.paymentIntents.create(paymentIntentParams),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Stripe API timeout')), 25000)
      )
    ]);
    
    console.log(`[${new Date().toISOString()}] Payment intent created: ${paymentIntent.id}`);
    
    // Respuesta optimizada para Vercel
    return res.status(200).json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    // Logging detallado para Vercel Functions
    console.error(`[${new Date().toISOString()}] Checkout API Error:`, {
      message: error.message,
      type: error.type || 'UnknownError',
      code: error.code || 'NO_CODE',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    // Manejo específico de errores de Stripe en Vercel
    if (error.type === 'StripeAuthenticationError') {
      return res.status(401).json({
        error: 'Stripe authentication failed',
        code: 'STRIPE_AUTH_ERROR'
      });
    }

    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        error: 'Invalid payment parameters',
        details: error.message,
        code: 'STRIPE_INVALID_REQUEST'
      });
    }

    if (error.message === 'Stripe API timeout') {
      return res.status(504).json({
        error: 'Payment service timeout',
        code: 'STRIPE_TIMEOUT'
      });
    }

    // Error genérico para producción
    return res.status(500).json({ 
      error: 'Payment initialization failed',
      code: 'PAYMENT_ERROR',
      timestamp: new Date().toISOString()
    });
  }
}
