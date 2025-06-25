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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { id } = req.query;
    
    if (id) {
      const result = await pool.query(`
        SELECT 
          id, title, price, image_url as "imageUrl", category, duration,
          rating, description, download_url as "downloadUrl", is_active as "isActive", badge
        FROM products 
        WHERE id = $1 AND is_active = true
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      const product = result.rows[0];
      product.imageUrl = convertGoogleDriveUrl(product.imageUrl);
      
      return res.json(product);
      
    } else {
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
    
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database connection failed' });
  }
};
