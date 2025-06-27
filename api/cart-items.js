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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-session-id');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sessionId = getSessionId(req);

  try {
    if (req.method === 'POST') {
      // Add item to cart
      const { productId } = req.body;
      
      // Get or create cart
      let cartResult = await pool.query('SELECT id FROM carts WHERE session_id = $1', [sessionId]);
      let cartId;
      
      if (cartResult.rows.length === 0) {
        const newCart = await pool.query('INSERT INTO carts (session_id) VALUES ($1) RETURNING id', [sessionId]);
        cartId = newCart.rows[0].id;
      } else {
        cartId = cartResult.rows[0].id;
      }
      
      // Check if item already exists
      const existingItem = await pool.query(
        'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cartId, productId]
      );
      
      if (existingItem.rows.length > 0) {
        // Update quantity
        await pool.query(
          'UPDATE cart_items SET quantity = quantity + 1 WHERE id = $1',
          [existingItem.rows[0].id]
        );
      } else {
        // Add new item
        await pool.query(
          'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, 1)',
          [cartId, productId]
        );
      }
      
      return res.status(200).json({ message: 'Item added to cart' });
    }

    if (req.method === 'PUT') {
      // Update item quantity
      const { id, quantity } = req.body;
      
      if (quantity <= 0) {
        await pool.query('DELETE FROM cart_items WHERE id = $1', [id]);
      } else {
        await pool.query('UPDATE cart_items SET quantity = $2 WHERE id = $1', [id, quantity]);
      }
      
      return res.status(200).json({ message: 'Item updated' });
    }

    if (req.method === 'DELETE') {
      // Remove item from cart
      const { id } = req.body;
      
      await pool.query('DELETE FROM cart_items WHERE id = $1', [id]);
      
      return res.status(200).json({ message: 'Item removed from cart' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Cart Items API Error:', error);
    return res.status(500).json({ error: 'Database error', details: error.message });
  }
}
