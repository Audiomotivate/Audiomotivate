const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Convert Google Drive URLs to direct image URLs
function convertGoogleDriveUrl(url) {
  if (!url) return null;
  
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }
  
  if (url.includes('drive.google.com/open?id=')) {
    const match = url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }
  
  return url;
}

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
    
    if (req.method === 'GET') {
      // Get cart items with product details
      const result = await client.query(`
        SELECT 
          ci.id,
          ci.product_id,
          ci.quantity,
          p.title,
          p.price,
          p.image_url,
          p.duration,
          p.category
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        JOIN carts c ON ci.cart_id = c.id
        WHERE c.session_id = $1
        ORDER BY ci.id ASC
      `, [sessionId]);
      
      const items = result.rows.map(item => ({
        id: item.id,
        productId: item.product_id,
        quantity: item.quantity,
        product: {
          id: item.product_id,
          title: item.title,
          price: item.price,
          imageUrl: convertGoogleDriveUrl(item.image_url),
          duration: item.duration,
          category: item.category
        }
      }));
      
      const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      client.release();
      return res.status(200).json({
        items,
        total,
        isOpen: false
      });
    }
    
    if (req.method === 'DELETE') {
      // Clear cart
      await client.query(`
        DELETE FROM cart_items 
        WHERE cart_id IN (
          SELECT id FROM carts WHERE session_id = $1
        )
      `, [sessionId]);
      
      client.release();
      return res.status(200).json({ message: 'Cart cleared' });
    }
    
    client.release();
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
