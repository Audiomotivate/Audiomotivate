const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  console.log(`GET /api/products - ID: ${id || 'all'}`);

  try {
    if (id) {
      // Get single product by ID
      const productId = parseInt(id, 10);
      
      if (isNaN(productId)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }
      
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
          is_bestseller as "isBestseller",
          is_new as "isNew",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM products 
        WHERE id = $1 AND is_active = true
        LIMIT 1
      `, [productId]);
      
      console.log(`Single product query for ID ${productId}: ${result.rows.length} rows`);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      return res.json(result.rows[0]);
      
    } else {
      // Get all products
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
          is_bestseller as "isBestseller",
          is_new as "isNew",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM products 
        WHERE is_active = true
        ORDER BY created_at DESC
      `);
      
      console.log(`All products query: ${result.rows.length} rows`);
      return res.json(result.rows);
    }
    
  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({ 
      error: 'Database operation failed',
      details: error.message 
    });
  }
};
