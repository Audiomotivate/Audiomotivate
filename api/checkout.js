// @vercel/node
module.exports = async function handler(req, res) {
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
    // Importación dinámica de Stripe para Vercel
    const Stripe = (await import('stripe')).default;
    
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    const { amount, currency = 'mxn', customerEmail, customerName, items } = req.body;

    console.log('[CHECKOUT] Processing payment:', { amount, currency, customerEmail, itemCount: items?.length });

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount',
        received: amount
      });
    }

    // Crear PaymentIntent con configuración simplificada (solo tarjetas)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir a centavos
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never' // Solo tarjetas, sin redirects
      },
      setup_future_usage: null, // No guardar tarjetas
      metadata: {
        customerEmail: customerEmail || 'no-email',
        customerName: customerName || 'no-name',
        itemCount: items?.length || 0,
        timestamp: new Date().toISOString()
      }
    });

    console.log('[CHECKOUT] PaymentIntent created:', paymentIntent.id);

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: currency.toUpperCase(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[CHECKOUT] Error:', error);
    return res.status(500).json({
      error: 'Payment processing failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
