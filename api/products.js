const { Pool, neonConfig } = require('@neondatabase/serverless');
neonConfig.webSocketConstructor = require('ws');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL
});

function convertGoogleDriveUrl(url) {
  if (!url) return url;
  
  if (url.includes('drive.google.com/file/d/')) {
    const fileId = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)[1];
    return `https://lh3.googleusercontent.com/d/${fileId}=w1000`;
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
      const result = await pool.query(`
        SELECT id, title, description, price, "imageUrl", "downloadUrl", type, duration, category, badge, "isActive"
        FROM products 
        WHERE "isActive" = true
        ORDER BY id ASC
      `);
      
      const products = result.rows.map(product => ({
        ...product,
        imageUrl: convertGoogleDriveUrl(product.imageUrl),
        downloadUrl: convertGoogleDriveUrl(product.downloadUrl)
      }));
      
      return res.status(200).json(products);
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Products API Error:', error);
    return res.status(500).json({ error: 'Database error', details: error.message });
  }
};
