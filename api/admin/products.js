const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Authentication check
function requireAuth(req) {
  return req.session && req.session.isAuthenticated;
}

module.exports = async (req, res) => {
  // Check authentication
  if (!requireAuth(req)) {
    return res.status(401).json({ error: 'Authentication required' });
  }

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
        preview_url as "previewUrl"
      FROM products 
      WHERE is_active = true 
      ORDER BY id DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
};
