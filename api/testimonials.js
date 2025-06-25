const { Pool, neonConfig } = require('@neondatabase/serverless');
neonConfig.webSocketConstructor = require('ws');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Z9w3h6xGOa6n@ep-steep-dream-a58a9ykl.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const result = await pool.query(`
        SELECT id, name, rating, comment, location, created_at
        FROM testimonials 
        ORDER BY created_at DESC
      `);
      
      const testimonials = result.rows.map(testimonial => ({
        id: testimonial.id,
        name: testimonial.name,
        rating: testimonial.rating,
        comment: testimonial.comment,
        location: testimonial.location,
        createdAt: testimonial.created_at
      }));
      
      return res.status(200).json(testimonials);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Testimonials API error:', error);
    return res.status(500).json({ 
      error: 'Database error',
      message: error.message 
    });
  }
};
