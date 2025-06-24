const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function checkAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;
  
  const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  return credentials[0] === 'admin' && credentials[1] === 'audiomotivate2025';
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!checkAuth(req)) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  console.log(`${req.method} /api/admin/products`);

  try {
    if (req.method === 'GET') {
      const result = await pool.query(`
        SELECT 
          id,
          title,
          description,
          type,
          category,
          price,
          image_url as "imageUrl",
          duration,
          is_active as "isActive",
          badge,
          download_url as "downloadUrl",
          preview_url as "previewUrl",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM products 
        ORDER BY id DESC
      `);
      
      console.log(`Found ${result.rows.length} products`);
      return res.json(result.rows);
      
    } else if (req.method === 'POST') {
      const { title, description, type, category, price, imageUrl, duration, badge, downloadUrl, previewUrl, isActive = true } = req.body;
      
      const result = await pool.query(`
        INSERT INTO products (title, description, type, category, price, image_url, duration, badge, download_url, preview_url, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, title, description, type, category, price, image_url as "imageUrl", duration, badge, download_url as "downloadUrl", preview_url as "previewUrl", is_active as "isActive"
      `, [title, description, type, category, price, imageUrl, duration, badge, downloadUrl, previewUrl, isActive]);
      
      console.log('Product created:', result.rows[0]);
      return res.json(result.rows[0]);
      
    } else if (req.method === 'PUT') {
      const { id, title, description, type, category, price, imageUrl, duration, badge, downloadUrl, previewUrl, isActive } = req.body;
      
      const result = await pool.query(`
        UPDATE products 
        SET title = $1, description = $2, type = $3, category = $4, price = $5, 
            image_url = $6, duration = $7, badge = $8, download_url = $9, 
            preview_url = $10, is_active = $11, updated_at = NOW()
        WHERE id = $12
        RETURNING id, title, description, type, category, price, image_url as "imageUrl", duration, badge, download_url as "downloadUrl", preview_url as "previewUrl", is_active as "isActive"
      `, [title, description, type, category, price, imageUrl, duration, badge, downloadUrl, previewUrl, isActive, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      console.log('Product updated:', result.rows[0]);
      return res.json(result.rows[0]);
      
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Product ID required' });
      }
      
      const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      console.log('Product deleted:', id);
      return res.json({ success: true, id });
      
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Database operation failed',
      details: error.message 
    });
  }
};
