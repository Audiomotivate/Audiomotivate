const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Content-Type', 'application/json');
  
  console.log('API Products called - Method:', req.method, 'URL:', req.url);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const sql = neon('postgresql://neondb_owner:npg_qBXg9wN8MpOv@ep-sparkling-river-aazlr1de-pooler.westus3.azure.neon.tech/neondb?sslmode=require');

    if (req.method === 'GET') {
      console.log('Fetching products from Neon database...');
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
      console.log('Products fetched:', products.length, 'items');
      return res.status(200).json(products);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Neon Database Error:', error);
    return res.status(500).json({ 
      error: 'Database connection failed',
      message: error.message
    });
  }
}
