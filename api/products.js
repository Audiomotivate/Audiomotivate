const { neon } = require('@neondatabase/serverless');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    if (req.method === 'GET') {
      const products = await sql`
        SELECT 
          id, title, description, type, category, price, 
          image_url as "imageUrl", download_url as "downloadUrl", 
          preview_url as "previewUrl", duration, 
          badge, is_bestseller as "isBestseller", 
          is_new as "isNew", is_active as "isActive",
          created_at as "createdAt", updated_at as "updatedAt"
        FROM products 
        WHERE is_active = true 
        ORDER BY id DESC
      `;
      return res.status(200).json(products);
    }
    
    if (req.method === 'POST') {
      const { 
        title, description, type, category, price, 
        imageUrl, downloadUrl, previewUrl, duration 
      } = req.body;
      
      const [product] = await sql`
        INSERT INTO products (
          title, description, type, category, price, 
          image_url, download_url, preview_url, duration, is_active
        )
        VALUES (
          ${title}, ${description}, ${type}, ${category}, ${price || 0}, 
          ${imageUrl || ''}, ${downloadUrl || ''}, ${previewUrl || ''}, ${duration || '45:30'}, true
        )
        RETURNING 
          id, title, description, type, category, price,
          image_url as "imageUrl", download_url as "downloadUrl",
          preview_url as "previewUrl", duration, badge,
          is_bestseller as "isBestseller", is_new as "isNew",
          is_active as "isActive", created_at as "createdAt",
          updated_at as "updatedAt"
      `;
      
      return res.status(201).json(product);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Database connection error',
      message: error.message 
    });
  }
};
