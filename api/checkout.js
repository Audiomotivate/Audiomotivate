export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ 
      error: 'Stripe configuration missing'
    });
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    if (req.method === 'POST') {
      const { amount, currency = 'mxn' } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }
      
      // Configuración Stripe SIN Link ni guardar tarjetas
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency: currency.toLowerCase(),
        payment_method_types: ['card'], // SOLO tarjetas
        automatic_payment_methods: {
          enabled: false, // Deshabilitar métodos automáticos
        },
        payment_method_options: {
          card: {
            setup_future_usage: null, // NO guardar tarjeta
            request_three_d_secure: 'automatic'
          }
        }
      });
      
      return res.status(200).json({ 
        clientSecret: paymentIntent.client_secret,
        amount,
        currency 
      });
      
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Stripe error:', error);
    return res.status(500).json({ 
      error: 'Payment failed',
      details: error.message
    });
  }
}
