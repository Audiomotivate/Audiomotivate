const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tXwAjwCGlj9v@ep-weathered-moon-a5lhb4r0.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const Stripe = await import('stripe');
      const stripe = new Stripe.default(process.env.STRIPE_SECRET_KEY || 'sk_test_51QT7IbP8VwxWqZJFiMnzJUZKOZSGPkdT2ksOVo5JlXW1xzSdKvbODPAi2EwqOwxh6M91mFPEV1IYU5ZEfcn3xCaD00xLu3zCDp');

      const { items, customerInfo } = req.body;
      
      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'No items in cart' });
      }

      const amount = items.reduce((total, item) => total + (item.price * item.quantity), 0);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'mxn',
        setup_future_usage: null,
        payment_method_options: {
          card: {
            setup_future_usage: null
          }
        },
        metadata: {
          customer_email: customerInfo?.email || '',
          customer_name: customerInfo?.name || '',
          items: JSON.stringify(items.map(item => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            price: item.price
          })))
        }
      });

      return res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Checkout API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
