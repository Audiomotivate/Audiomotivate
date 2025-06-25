const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const result = await pool.query(`
      SELECT 
        id, name, rating, comment, location
      FROM testimonials 
      ORDER BY id ASC
    `);
    
    return res.json(result.rows);
    
  } catch (error) {
    console.error('Testimonials error:', error);
    return res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
};
