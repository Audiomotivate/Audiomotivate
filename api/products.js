import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      SELECT * FROM products WHERE is_active = true ORDER BY id DESC
      res.json(products);
    } else if (req.method === 'POST') {
      const { title, description, type, category, price, imageUrl, downloadUrl, duration } = req.body;
      const [product] = await sql`
        INSERT INTO products (title, description, type, category, price, "imageUrl", "downloadUrl", duration, is_active)
        VALUES (${title}, ${description}, ${type}, ${category}, ${price}, ${imageUrl}, ${downloadUrl}, ${duration || '45:30'}, true)
        RETURNING *
      `;
      res.json(product);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Products API error:', error);
    res.status(500).json({ error: 'Database error' });
  }
}
