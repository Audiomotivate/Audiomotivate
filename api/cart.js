const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tXwAjwCGlj9v@ep-weathered-moon-a5lhb4r0.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

function convertGoogleDriveUrl(url) {
  if (!url) return url;
  const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (fileIdMatch) {
    const fileId = fileIdMatch[1];
    return `https://lh3.googleusercontent.com/d/${fileId}=w400-h600-c`;
  }
  return url;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-ID');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const sessionId = req.headers['x-session-id'] || 'anonymous';
      const client = await pool.connect();
      
      const cartResult = await client.query('SELECT id FROM carts WHERE session_id = $1', [sessionId]);
      
      if (cartResult.rows.length === 0) {
        client.release();
        return res.json({
          cart: {
            id: null,
            sessionId: sessionId,
            items: [],
            total: 0
          }
        });
      }
      
      const cartId = cartResult.rows[0].id;
      
      const itemsResult = await client.query(`
        SELECT ci.id, ci.quantity, ci.product_id,
               p.title, p.price, p.image_url
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = $1
      `, [cartId]);
      
      client.release();
      
      const items = itemsResult.rows.map(item => ({
        id: item.id,
        productId: item.product_id,
        quantity: item.quantity,
        product: {
          id: item.product_id,
          title: item.title,
          price: item.price,
          imageUrl: convertGoogleDriveUrl(item.image_url)
        }
      }));
      
      const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      return res.json({
        cart: {
          id: cartId,
          sessionId: sessionId,
          items: items,
          total: total
        }
      });
    }
    
    if (req.method === 'DELETE') {
      const sessionId = req.headers['x-session-id'] || 'anonymous';
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        const cartResult = await client.query('SELECT id FROM carts WHERE session_id = $1', [sessionId]);
        
        if (cartResult.rows.length > 0) {
          const cartId = cartResult.rows[0].id;
          await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
          await client.query('DELETE FROM carts WHERE id = $1', [cartId]);
        }
        
        await client.query('COMMIT');
        client.release();
        
        return res.json({ success: true });
      } catch (error) {
        await client.query('ROLLBACK');
        client.release();
        throw error;
      }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Cart API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
