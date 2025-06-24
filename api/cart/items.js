const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-session-id');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log(`${req.method} /api/cart/items`);

  try {
    const sessionId = req.headers['x-session-id'] || req.headers['X-Session-Id'] || 'default-session';
    
    if (req.method === 'GET') {
      // Get cart items
      const result = await pool.query(`
        SELECT 
          ci.id,
          ci.product_id as "productId",
          ci.quantity,
          p.title,
          p.price,
          p.image_url as "imageUrl",
          p.type,
          p.category
        FROM cart_items ci
        JOIN carts c ON ci.cart_id = c.id
        JOIN products p ON ci.product_id = p.id
        WHERE c.session_id = $1
      `, [sessionId]);
      
      console.log(`Found ${result.rows.length} cart items for session ${sessionId}`);
      return res.json(result.rows);
      
    } else if (req.method === 'POST') {
      const { productId, quantity = 1 } = req.body;
      
      if (!productId) {
        return res.status(400).json({ error: 'Product ID required' });
      }
      
      // Get or create cart
      let cartResult = await pool.query('SELECT id FROM carts WHERE session_id = $1', [sessionId]);
      let cartId;
      
      if (cartResult.rows.length === 0) {
        const newCart = await pool.query(
          'INSERT INTO carts (session_id) VALUES ($1) RETURNING id',
          [sessionId]
        );
        cartId = newCart.rows[0].id;
        console.log(`Created new cart ${cartId} for session ${sessionId}`);
      } else {
        cartId = cartResult.rows[0].id;
      }
      
      // Check if item already exists in cart
      const existingItem = await pool.query(
        'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cartId, productId]
      );
      
      if (existingItem.rows.length > 0) {
        // Update quantity
        const newQuantity = existingItem.rows[0].quantity + quantity;
        await pool.query(
          'UPDATE cart_items SET quantity = $1 WHERE id = $2',
          [newQuantity, existingItem.rows[0].id]
        );
        console.log(`Updated product ${productId} quantity to ${newQuantity}`);
      } else {
        // Add new item
        await pool.query(
          'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
          [cartId, productId, quantity]
        );
        console.log(`Added new product ${productId} to cart ${cartId}`);
      }
      
      return res.json({ 
        success: true,
        message: 'Product added to cart successfully',
        cartId,
        productId,
        quantity
      });
      
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Cart items API error:', error);
    return res.status(500).json({ 
      error: 'Cart operation failed',
      details: error.message 
    });
  }
};
