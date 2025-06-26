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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const client = await pool.connect();
    
    if (req.method === 'GET') {
      // Check if it's a single product request
      const { id } = req.query;
      
      if (id) {
        // Get single product
        const result = await client.query(
          'SELECT * FROM products WHERE id = $1 AND is_active = true',
          [id]
        );
        
        if (result.rows.length === 0) {
          client.release();
          return res.status(404).json({ error: 'Product not found' });
        }
        
        const product = result.rows[0];
        const transformedProduct = {
          id: product.id,
          title: product.title,
          category: product.category,
          price: product.price,
          duration: product.duration,
          rating: product.rating,
          imageUrl: convertGoogleDriveUrl(product.image_url),
          previewUrl: product.preview_url,
          downloadUrl: product.download_url,
          badge: product.badge,
          isActive: product.is_active
        };
        
        client.release();
        return res.status(200).json(transformedProduct);
      } else {
        // Get all products
        const result = await client.query(
          'SELECT * FROM products WHERE is_active = true ORDER BY id ASC'
        );
        
        const products = result.rows.map(product => ({
          id: product.id,
          title: product.title,
          category: product.category,
          price: product.price,
          duration: product.duration,
          rating: product.rating,
          imageUrl: convertGoogleDriveUrl(product.image_url),
          previewUrl: product.preview_url,
          downloadUrl: product.download_url,
          badge: product.badge,
          isActive: product.is_active
        }));
        
        client.release();
        return res.status(200).json(products);
      }
    }
    
    client.release();
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
