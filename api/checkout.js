import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL
});

function getSessionId(req) {
  return req.headers['x-session-id'] || 'anonymous';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-session-id');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const sessionId = getSessionId(req);
      
      // Get cart items
      const cartResult = await pool.query(`
        SELECT 
          ci.product_id,
          ci.quantity,
          p.title,
          p.price
        FROM cart_items ci
        JOIN carts c ON ci.cart_id = c.id
        JOIN products p ON ci.product_id = p.id
        WHERE c.session_id = $1
      `, [sessionId]);
      
      if (cartResult.rows.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }
      
      // Calculate total
      const total = cartResult.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Import Stripe dynamically
      const { default: Stripe } = await import('stripe');
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // Convert to cents
        currency: 'mxn',
        metadata: {
          sessionId,
          products: JSON.stringify(cartResult.rows.map(item => ({
            id: item.product_id,
            title: item.title,
            quantity: item.quantity,
            price: item.price
          })))
        }
      });

      return res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Checkout API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
