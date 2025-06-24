const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log(`${req.method} /api/cart`);

  try {
    const sessionId = req.headers['x-session-id'] || 'default-session';
    
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
      } else {
        // Add new item
        await pool.query(
          'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
          [cartId, productId, quantity]
        );
      }
      
      console.log(`Added product ${productId} to cart for session ${sessionId}`);
      return res.json({ success: true });
      
    } else if (req.method === 'PUT') {
      const { productId, quantity } = req.body;
      
      if (!productId || quantity < 0) {
        return res.status(400).json({ error: 'Invalid product ID or quantity' });
      }
      
      const result = await pool.query(`
        UPDATE cart_items 
        SET quantity = $3
        FROM carts 
        WHERE cart_items.cart_id = carts.id 
          AND carts.session_id = $1 
          AND cart_items.product_id = $2
      `, [sessionId, productId, quantity]);
      
      console.log(`Updated quantity for product ${productId} to ${quantity}`);
      return res.json({ success: true });
      
    } else if (req.method === 'DELETE') {
      const { productId } = req.query;
      
      if (productId) {
        // Remove specific item
        await pool.query(`
          DELETE FROM cart_items 
          USING carts 
          WHERE cart_items.cart_id = carts.id 
            AND carts.session_id = $1 
            AND cart_items.product_id = $2
        `, [sessionId, productId]);
        
        console.log(`Removed product ${productId} from cart`);
      } else {
        // Clear entire cart
        await pool.query(`
          DELETE FROM cart_items 
          USING carts 
          WHERE cart_items.cart_id = carts.id 
            AND carts.session_id = $1
        `, [sessionId]);
        
        console.log(`Cleared cart for session ${sessionId}`);
      }
      
      return res.json({ success: true });
      
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Cart API error:', error);
    return res.status(500).json({ 
      error: 'Cart operation failed',
      details: error.message 
    });
  }
};
