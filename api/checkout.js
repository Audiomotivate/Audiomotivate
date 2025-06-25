const { Pool, neonConfig } = require('@neondatabase/serverless');
neonConfig.webSocketConstructor = require('ws');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Z9w3h6xGOa6n@ep-steep-dream-a58a9ykl.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

let Stripe;

async function getStripe() {
  if (!Stripe) {
    Stripe = (await import('stripe')).default;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51QWz6wA8xDzAzVVZxOtM7jFHfYKtCJHN5j8vVHQpOHKOQqKNhEZRvVSPEgKTOuXY6cDfPBqmJSpvOUZLbIgQ6RiP00P4ZgXP1z', {
    apiVersion: '2023-10-16'
  });
}

function getSessionId(req) {
  return req.headers['x-session-id'] || 'anonymous';
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-session-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const sessionId = getSessionId(req);
    
    try {
      // Get cart items
      const cartResult = await pool.query(`
        SELECT ci.quantity, ci.product_id,
               p.title, p.price, p.download_url
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.session_id = $1
      `, [sessionId]);

      if (cartResult.rows.length === 0) {
        return res.status(400).json({ error: 'Carrito vacío' });
      }

      // Calculate total
      const total = cartResult.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Create Stripe payment intent
      const stripe = await getStripe();
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // Convert to centavos
        currency: 'mxn',
        metadata: {
          sessionId: sessionId,
          products: JSON.stringify(cartResult.rows.map(item => ({
            id: item.product_id,
            title: item.title,
            quantity: item.quantity,
            price: item.price
          })))
        },
        setup_future_usage: null // No save card option
      });

      return res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        amount: total
      });

    } catch (error) {
      console.error('Checkout API error:', error);
      return res.status(500).json({ 
        error: 'Payment intent creation failed',
        message: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
