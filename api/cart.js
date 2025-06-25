// @vercel/node
const { Pool, neonConfig } = require('@neondatabase/serverless');
neonConfig.webSocketConstructor = require('ws');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Z9w3h6xGOa6n@ep-steep-dream-a58a9ykl.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

function getSessionId(req) {
  return req.headers['x-session-id'] || 'anonymous';
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-session-id');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sessionId = getSessionId(req);

  try {
    if (req.method === 'GET') {
      // Get cart with items and product details
      const cartQuery = `
        SELECT 
          ci.id,
          ci.product_id as "productId",
          ci.quantity,
          p.id as "product.id",
          p.title as "product.title",
          p.price as "product.price",
          p.image_url as "product.imageUrl"
        FROM cart_items ci
        JOIN carts c ON ci.cart_id = c.id
        JOIN products p ON ci.product_id = p.id
        WHERE c.session_id = $1
      `;
      
      const result = await pool.query(cartQuery, [sessionId]);
      
      // Transform flat rows to nested structure
      const items = result.rows.map(row => ({
        id: row.id,
        productId: row.productId,
        quantity: row.quantity,
        product: {
          id: row['product.id'],
          title: row['product.title'],
          price: row['product.price'],
          imageUrl: row['product.imageUrl']
        }
      }));
      
      const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      return res.status(200).json({
        items,
        total,
        isOpen: false
      });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Cart API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
