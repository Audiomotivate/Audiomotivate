const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log(`${req.method} /api/products`);

  try {
    if (req.method === 'GET') {
      const { id } = req.query;
      
      if (id) {
        // Get single product by ID
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
          WHERE id = $1 AND is_active = true
        `, [id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Product not found' });
        }
        
        console.log(`Found product ${id}:`, result.rows[0]);
        return res.json(result.rows[0]);
        
      } else {
        // Get all active products
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
          WHERE is_active = true
          ORDER BY created_at DESC
        `);
        
        console.log(`Found ${result.rows.length} active products`);
        return res.json(result.rows);
      }
      
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
