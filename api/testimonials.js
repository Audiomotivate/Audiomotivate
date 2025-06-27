import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const result = await pool.query(`
        SELECT id, name, rating, comment, location
        FROM testimonials 
        ORDER BY id ASC
      `);
      
      return res.status(200).json(result.rows);
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Testimonials API Error:', error);
    return res.status(500).json({ error: 'Database error', details: error.message });
  }
}
