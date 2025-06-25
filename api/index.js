const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function convertGoogleDriveUrl(url) {
  if (!url) return url;
  if (url.includes('thumbnail')) return url;
  if (url.includes('drive.google.com/file/d/')) {
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch) {
      return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w300-h400`;
    }
  }
  return url;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  try {
    // Products endpoint
    if (pathname === '/api' || pathname === '/api/products') {
      const result = await pool.query(`
        SELECT 
          id, title, price, image_url as "imageUrl", category, duration,
          rating, description, download_url as "downloadUrl", is_active as "isActive", badge
        FROM products 
        WHERE is_active = true
        ORDER BY id ASC
      `);
      
      const products = result.rows.map(product => ({
        ...product,
        imageUrl: convertGoogleDriveUrl(product.imageUrl)
      }));
      
      return res.json(products);
    }

    // Testimonials endpoint
    if (pathname === '/api/testimonials') {
      const result = await pool.query(`
        SELECT id, name, rating, comment, location
        FROM testimonials 
        ORDER BY id ASC
      `);
      return res.json(result.rows);
    }

    return res.status(404).json({ error: 'Endpoint not found' });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
};
