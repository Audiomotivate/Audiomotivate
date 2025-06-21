const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    if (req.method === 'GET') {
      const products = await sql`
        SELECT 
          id, title, description, type, category, price, 
          "imageUrl", "downloadUrl", "previewUrl", duration, 
          badge, "isBestseller", "isNew", is_active as "isActive",
          "createdAt", "updatedAt"
        FROM products 
        WHERE is_active = true 
        ORDER BY id DESC
      `;
      return res.status(200).json(products);
    } 
    
    if (req.method === 'POST') {
      const { 
        title, description, type, category, price, 
        imageUrl, downloadUrl, previewUrl, duration, 
        badge, isBestseller, isNew 
      } = req.body;
      
      const [product] = await sql`
        INSERT INTO products (
          title, description, type, category, price, 
          "imageUrl", "downloadUrl", "previewUrl", duration, 
          badge, "isBestseller", "isNew", is_active
        )
        VALUES (
          ${title}, ${description}, ${type}, ${category}, ${price || 0}, 
          ${imageUrl || ''}, ${downloadUrl || ''}, ${previewUrl || ''}, ${duration || '45:30'}, 
          ${badge || ''}, ${isBestseller || false}, ${isNew || false}, true
        )
        RETURNING *
      `;
      
      return res.status(201).json(product);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Database connection error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
