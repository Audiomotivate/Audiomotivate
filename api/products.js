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
      const { id } = req.query;
      const client = await pool.connect();
      
      if (id) {
        const result = await client.query('SELECT * FROM products WHERE id = $1', [id]);
        client.release();
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Product not found' });
        }
        
        const product = result.rows[0];
        return res.json({
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price,
          category: product.category,
          imageUrl: convertGoogleDriveUrl(product.image_url),
          previewUrl: product.preview_url,
          downloadUrl: product.download_url,
          duration: product.duration,
          badge: product.badge,
          isActive: product.is_active,
          createdAt: product.created_at
        });
      } else {
        const result = await client.query('SELECT * FROM products WHERE is_active = true ORDER BY id');
        client.release();
        
        const products = result.rows.map(product => ({
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price,
          category: product.category,
          imageUrl: convertGoogleDriveUrl(product.image_url),
          previewUrl: product.preview_url,
          downloadUrl: product.download_url,
          duration: product.duration,
          badge: product.badge,
          isActive: product.is_active,
          createdAt: product.created_at
        }));
        
        return res.json(products);
      }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Products API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
};
