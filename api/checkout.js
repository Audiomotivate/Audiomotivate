const { Pool } = require('@neondatabase/serverless');
const Stripe = require('stripe');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log(`${req.method} /api/checkout`);

  try {
    if (req.method === 'POST') {
      const { amount, currency = 'mxn', customer } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }
      
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // Amount in centavos for MXN
        currency: currency.toLowerCase(),
        metadata: {
          customer_name: customer ? `${customer.firstName} ${customer.lastName}` : 'Guest',
          customer_email: customer?.email || 'no-email@audiomotivate.com'
        },
        receipt_email: customer?.email,
      });
      
      console.log(`Created Stripe payment intent ${paymentIntent.id} for ${amount} ${currency.toUpperCase()}`);
      return res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount,
        currency 
      });
      
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Checkout API error:', error);
    return res.status(500).json({ 
      error: 'Checkout failed',
      details: error.message 
    });
  }
};
