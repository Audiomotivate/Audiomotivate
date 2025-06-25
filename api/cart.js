const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function getSessionId(req) {
  return req.headers['x-session-id'] || 'anonymous';
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-session-id');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sessionId = getSessionId(req);

  try {
    if (req.method === 'GET') {
      const result = await pool.query(`
        SELECT 
          ci.id,
          ci.product_id as "productId",
          ci.quantity,
          p.title,
          p.price,
          p.image_url as "imageUrl"
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        JOIN carts c ON ci.cart_id = c.id
        WHERE c.session_id = $1
      `, [sessionId]);

      const items = result.rows.map(item => ({
        ...item,
        product: {
          id: item.productId,
          title: item.title,
          price: item.price,
          imageUrl: item.imageUrl
        }
      }));

      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return res.json({
        items,
        total,
        isOpen: false
      });
    }

    if (req.method === 'POST') {
      const { productId, quantity = 1 } = req.body;

      let cartResult = await pool.query(
        'SELECT id FROM carts WHERE session_id = $1',
        [sessionId]
      );

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

      const existingItem = await pool.query(
        'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cartId, productId]
      );

      if (existingItem.rows.length > 0) {
        await pool.query(
          'UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2',
          [quantity, existingItem.rows[0].id]
        );
      } else {
        await pool.query(
          'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
          [cartId, productId, quantity]
        );
      }

      return res.json({ success: true });
    }

    if (req.method === 'DELETE') {
      await pool.query(
        'DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE session_id = $1)',
        [sessionId]
      );
      return res.json({ success: true });
    }

  } catch (error) {
    console.error('Cart error:', error);
    return res.status(500).json({ error: 'Cart operation failed' });
  }
};
