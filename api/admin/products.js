const { neon } = require('@neondatabase/serverless');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
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
    
    // POST, PUT, DELETE methods...
    
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Database connection error',
      message: error.message
    });
  }
};
