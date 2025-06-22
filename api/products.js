const { neon } = require('@neondatabase/serverless');

export default async function handler(request, response) {
  response.setHeader('Content-Type', 'application/json');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    if (request.method === 'GET') {
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
      return response.status(200).json(products);
    }
    
    return response.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Database error:', error);
    return response.status(500).json({ 
      error: 'Database connection error',
      message: error.message 
    });
  }
}
