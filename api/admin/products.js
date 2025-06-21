import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const products = await sql`SELECT * FROM products WHERE is_active = true ORDER BY id DESC`;
      return res.status(200).json(products);
    } 
    
    if (req.method === 'POST') {
      const { title, description, type, category, price, imageUrl, downloadUrl, duration } = req.body;
      
      const [product] = await sql`
        INSERT INTO products (title, description, type, category, price, "imageUrl", "downloadUrl", duration, is_active)
        VALUES (${title}, ${description}, ${type}, ${category}, ${price}, ${imageUrl}, ${downloadUrl}, ${duration || '45:30'}, true)
        RETURNING *
      `;
      
      return res.status(201).json(product);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
