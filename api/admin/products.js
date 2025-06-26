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
    const client = await pool.connect();
    
    if (req.method === 'GET') {
      const result = await client.query('SELECT * FROM products ORDER BY id');
      client.release();
      
      const products = result.rows.map(product => ({
        id: product.id,
        title: product.title,
        description: product.description,
        type: product.type,
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
    
    if (req.method === 'POST') {
      const { id, title, description, type, price, category, imageUrl, previewUrl, downloadUrl, duration, badge, isActive } = req.body;
      
      const result = await client.query(
        `INSERT INTO products (id, title, description, type, price, category, image_url, preview_url, download_url, duration, badge, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
         ON CONFLICT (id) DO UPDATE SET 
         title = EXCLUDED.title, description = EXCLUDED.description, type = EXCLUDED.type,
         price = EXCLUDED.price, category = EXCLUDED.category, image_url = EXCLUDED.image_url,
         preview_url = EXCLUDED.preview_url, download_url = EXCLUDED.download_url,
         duration = EXCLUDED.duration, badge = EXCLUDED.badge, is_active = EXCLUDED.is_active
         RETURNING *`,
        [id || Date.now(), title, description, type, price, category, imageUrl, previewUrl, downloadUrl, duration, badge, isActive !== false]
      );
      client.release();
      
      const product = result.rows[0];
      return res.json({
        id: product.id,
        title: product.title,
        description: product.description,
        type: product.type,
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
    }
    
    if (req.method === 'PUT') {
      const { id } = req.query;
      const { title, description, type, price, category, imageUrl, previewUrl, downloadUrl, duration, badge, isActive } = req.body;
      
      const result = await client.query(
        `UPDATE products SET title = $1, description = $2, type = $3, price = $4, category = $5, 
         image_url = $6, preview_url = $7, download_url = $8, duration = $9, badge = $10, is_active = $11
         WHERE id = $12 RETURNING *`,
        [title, description, type, price, category, imageUrl, previewUrl, downloadUrl, duration, badge, isActive, id]
      );
      client.release();
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      const product = result.rows[0];
      return res.json({
        id: product.id,
        title: product.title,
        description: product.description,
        type: product.type,
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
    }
    
    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      const result = await client.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
      client.release();
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      return res.json({ success: true });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Admin Products API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
