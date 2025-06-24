const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log(`${req.method} /api/testimonials`);

  try {
    if (req.method === 'GET') {
      const result = await pool.query(`
        SELECT 
          id,
          name,
          content,
          rating,
          created_at as "createdAt"
        FROM testimonials 
        ORDER BY created_at DESC
      `);
      
      console.log(`Found ${result.rows.length} testimonials`);
      return res.json(result.rows);
      
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Testimonials API error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch testimonials',
      details: error.message 
    });
  }
};
