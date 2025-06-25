const { Pool } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (!process.env.DATABASE_URL) {
      return res.json([
        {
          "id": 3,
          "title": "El Único Audiolibro que Necesitas para Dominar la Energía Cuántica",
          "price": 4.99,
          "imageUrl": "https://lh3.googleusercontent.com/d/1abc123=w300-h400",
          "category": "audiolibro",
          "duration": "49:30",
          "rating": 4.9,
          "description": "Descubre los secretos de la energía cuántica",
          "downloadUrl": "https://drive.google.com/file/d/example",
          "isActive": true,
          "badge": null
        }
      ]);
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    const result = await pool.query(`
      SELECT 
        id, title, price, image_url as "imageUrl", category, duration,
        rating, description, download_url as "downloadUrl", is_active as "isActive", badge
      FROM products 
      WHERE is_active = true
      ORDER BY id ASC
    `);
    
    return res.json(result.rows);
    
  } catch (error) {
    console.error('API Error:', error);
    return res.json([]);
  }
};
