const { Pool, neonConfig } = require('@neondatabase/serverless');
neonConfig.webSocketConstructor = require('ws');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Z9w3h6xGOa6n@ep-steep-dream-a58a9ykl.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

function getSessionId(req) {
  return req.headers['x-session-id'] || 'anonymous';
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
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
        SELECT ci.id, ci.quantity, ci.product_id,
               p.title, p.price, p.image_url
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.session_id = $1
      `, [sessionId]);

      const items = result.rows.map(item => ({
        id: item.id,
        productId: item.product_id,
        quantity: item.quantity,
        product: {
          id: item.product_id,
          title: item.title,
          price: item.price,
          imageUrl: item.image_url
        }
      }));

      const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

      return res.status(200).json({
        items,
        total,
        count: items.length
      });
    }

    if (req.method === 'DELETE') {
      await pool.query('DELETE FROM cart_items WHERE session_id = $1', [sessionId]);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Cart API error:', error);
    return res.status(500).json({ 
      error: 'Database error',
      message: error.message 
    });
  }
};
