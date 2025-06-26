const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tXwAjwCGlj9v@ep-weathered-moon-a5lhb4r0.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM testimonials WHERE is_active = true ORDER BY id');
      client.release();
      
      const testimonials = result.rows.map(testimonial => ({
        id: testimonial.id,
        name: testimonial.name,
        text: testimonial.text,
        rating: testimonial.rating,
        imageUrl: testimonial.image_url,
        isActive: testimonial.is_active,
        createdAt: testimonial.created_at
      }));
      
      return res.json(testimonials);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Testimonials API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
