const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-ID');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Dynamic import of Stripe for serverless compatibility
    const Stripe = (await import('stripe')).default;
    
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    const client = await pool.connect();
    const sessionId = req.headers['x-session-id'] || 'default-session';
    
    // Get cart items
    const cartResult = await client.query(`
      SELECT 
        ci.id,
        ci.product_id,
        ci.quantity,
        p.title,
        p.price,
        p.download_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN carts c ON ci.cart_id = c.id
      WHERE c.session_id = $1
      ORDER BY ci.id ASC
    `, [sessionId]);
    
    if (cartResult.rows.length === 0) {
      client.release();
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    const items = cartResult.rows;
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'mxn',
      metadata: {
        sessionId: sessionId,
        products: JSON.stringify(items.map(item => ({
          id: item.product_id,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          downloadUrl: item.download_url
        })))
      },
      setup_future_usage: null,
    });
    
    client.release();
    
    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      amount: total
    });
    
  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ 
      error: 'Payment processing failed',
      details: error.message 
    });
  }
};
