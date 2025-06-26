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
      const { productId, quantity = 1 } = req.body;
      const sessionId = req.headers['x-session-id'] || 'anonymous';
      
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        let cartResult = await client.query('SELECT id FROM carts WHERE session_id = $1', [sessionId]);
        let cartId;
        
        if (cartResult.rows.length === 0) {
          const newCartResult = await client.query(
            'INSERT INTO carts (session_id) VALUES ($1) RETURNING id',
            [sessionId]
          );
          cartId = newCartResult.rows[0].id;
        } else {
          cartId = cartResult.rows[0].id;
        }
        
        const existingItem = await client.query(
          'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
          [cartId, productId]
        );
        
        if (existingItem.rows.length > 0) {
          await client.query(
            'UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2',
            [quantity, existingItem.rows[0].id]
          );
        } else {
          await client.query(
            'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
            [cartId, productId, quantity]
          );
        }
        
        await client.query('COMMIT');
        return res.json({ success: true });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Cart Items API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
