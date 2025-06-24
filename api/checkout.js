export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    if (req.method === 'POST') {
      const { amount, currency = 'mxn', customerEmail, customerName, cartItems } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }
      
      console.log(`Creating payment intent for ${amount} ${currency.toUpperCase()}`);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency: currency.toLowerCase(),
        payment_method_types: ['card'],
        automatic_payment_methods: {
          enabled: false,
        },
        metadata: {
          customerEmail: customerEmail || '',
          customerName: customerName || '',
          cartItems: JSON.stringify(cartItems || [])
        }
      });
      
      return res.status(200).json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id 
      });
      
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Stripe API error:', error);
    return res.status(500).json({ 
      error: 'Payment initialization failed',
      details: error.message
    });
  }
}
