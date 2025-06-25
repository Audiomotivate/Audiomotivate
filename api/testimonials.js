// @vercel/node
const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    if (req.method === 'GET') {
      const testimonials = await sql`
        SELECT id, name, rating, comment, location, created_at as "createdAt"
        FROM testimonials 
        WHERE is_active = true 
        ORDER BY created_at DESC
      `;
      return res.status(200).json(testimonials);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Testimonials API error:', error);
    return res.status(500).json({ 
      error: 'Database connection error',
      message: error.message 
    });
  }
}
