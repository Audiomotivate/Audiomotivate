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

  try {
    const client = await pool.connect();
    const sessionId = req.headers['x-session-id'] || 'default-session';
    
    if (req.method === 'POST') {
      // Add item to cart
      const { productId, quantity = 1 } = req.body;
      
      // Get or create cart
      let cartResult = await client.query(
        'SELECT id FROM carts WHERE session_id = $1',
        [sessionId]
      );
      
      let cartId;
      if (cartResult.rows.length === 0) {
        // Create new cart
        const newCartResult = await client.query(
          'INSERT INTO carts (session_id) VALUES ($1) RETURNING id',
          [sessionId]
        );
        cartId = newCartResult.rows[0].id;
      } else {
        cartId = cartResult.rows[0].id;
      }
      
      // Check if item already exists in cart
      const existingItemResult = await client.query(
        'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cartId, productId]
      );
      
      if (existingItemResult.rows.length > 0) {
        // Update existing item quantity
        const newQuantity = existingItemResult.rows[0].quantity + quantity;
        await client.query(
          'UPDATE cart_items SET quantity = $1 WHERE id = $2',
          [newQuantity, existingItemResult.rows[0].id]
        );
      } else {
        // Add new item to cart
        await client.query(
          'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
          [cartId, productId, quantity]
        );
      }
      
      client.release();
      return res.status(200).json({ message: 'Item added to cart' });
    }
    
    if (req.method === 'PUT') {
      // Update item quantity
      const { id } = req.query;
      const { quantity } = req.body;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        await client.query('DELETE FROM cart_items WHERE id = $1', [id]);
      } else {
        // Update quantity
        await client.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [quantity, id]);
      }
      
      client.release();
      return res.status(200).json({ message: 'Cart item updated' });
    }
    
    if (req.method === 'DELETE') {
      // Remove item from cart
      const { id } = req.query;
      
      await client.query('DELETE FROM cart_items WHERE id = $1', [id]);
      
      client.release();
      return res.status(200).json({ message: 'Item removed from cart' });
    }
    
    client.release();
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
