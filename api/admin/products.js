const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Simple authentication check for Vercel serverless
function checkAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;
  
  const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  return credentials[0] === 'admin' && credentials[1] === 'audiomotivate2025';
}

module.exports = async (req, res) => {
  // CORS headers for admin panel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check authentication
  if (!checkAuth(req)) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    try {
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
      
      res.json(result.rows);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Error fetching products' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, description, type, category, price, imageUrl, duration, badge, downloadUrl, previewUrl, isActive = true } = req.body;
      
      const result = await pool.query(`
        INSERT INTO products (title, description, type, category, price, image_url, duration, badge, download_url, preview_url, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, title, description, type, category, price, image_url as "imageUrl", duration, badge, download_url as "downloadUrl", preview_url as "previewUrl", is_active as "isActive"
      `, [title, description, type, category, price, imageUrl, duration, badge, downloadUrl, previewUrl, isActive]);
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Error creating product' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, title, description, type, category, price, imageUrl, duration, badge, downloadUrl, previewUrl, isActive } = req.body;
      
      const result = await pool.query(`
        UPDATE products 
        SET title = $1, description = $2, type = $3, category = $4, price = $5, 
            image_url = $6, duration = $7, badge = $8, download_url = $9, 
            preview_url = $10, is_active = $11, updated_at = NOW()
        WHERE id = $12
        RETURNING id, title, description, type, category, price, image_url as "imageUrl", duration, badge, download_url as "downloadUrl", preview_url as "previewUrl", is_active as "isActive"
      `, [title, description, type, category, price, imageUrl, duration, badge, downloadUrl, previewUrl, isActive, id]);
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Error updating product' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      
      await pool.query('DELETE FROM products WHERE id = $1', [id]);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Error deleting product' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
