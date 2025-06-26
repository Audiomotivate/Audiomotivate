const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const client = await pool.connect();
    
    if (req.method === 'GET') {
      // Get all testimonials
      const result = await client.query(
        'SELECT * FROM testimonials ORDER BY id ASC'
      );
      
      const testimonials = result.rows.map(testimonial => ({
        id: testimonial.id,
        name: testimonial.name,
        rating: testimonial.rating,
        comment: testimonial.comment,
        location: testimonial.location
      }));
      
      client.release();
      return res.status(200).json(testimonials);
    }
    
    client.release();
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
