// Vercel Serverless Function for Stripe Checkout
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Environment validation
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY not configured in Vercel');
    return res.status(500).json({ 
      error: 'Stripe configuration missing',
      details: 'STRIPE_SECRET_KEY environment variable not set'
    });
  }

  try {
    // Dynamic import for Stripe (works better in Vercel)
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    if (req.method === 'POST') {
      const { amount, currency = 'mxn', customer } = req.body;
      
      // Validation
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }
      
      console.log(`Creating payment intent for ${amount} ${currency.toUpperCase()}`);
      
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // Amount in centavos for MXN
        currency: currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never' // Disable Link and other redirects
        },
        payment_method_options: {
          card: {
            setup_future_usage: null // Don't save card details
          },
          link: {
            persistent_token: null // Disable Link completely
          }
        },
        metadata: {
          customer_name: customer ? `${customer.firstName} ${customer.lastName}` : 'Guest',
          customer_email: customer?.email || 'no-email@audiomotivate.com'
        },
        receipt_email: customer?.email,
      });
      
      console.log(`Payment intent created: ${paymentIntent.id}`);
      
      return res.status(200).json({ 
        clientSecret: paymentIntent.client_secret,
        amount,
        currency 
      });
      
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Stripe API error:', error);
    return res.status(500).json({ 
      error: 'Payment initialization failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
