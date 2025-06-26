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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const sessionId = req.headers['x-session-id'] || 'anonymous';
      const client = await pool.connect();
      
      const cartResult = await client.query(
        `SELECT c.id, ci.id as item_id, ci.product_id, ci.quantity, 
                p.title, p.price, p.image_url, p.category
         FROM carts c
         JOIN cart_items ci ON c.id = ci.cart_id
         JOIN products p ON ci.product_id = p.id
         WHERE c.session_id = $1`,
        [sessionId]
      );
      
      client.release();
      
      const items = cartResult.rows.map(row => ({
        id: row.item_id,
        productId: row.product_id,
        quantity: row.quantity,
        product: {
          id: row.product_id,
          title: row.title,
          price: row.price,
          imageUrl: convertGoogleDriveUrl(row.image_url),
          category: row.category
        }
      }));
      
      const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      return res.json({ items, total });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Cart API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
