import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const sql = neon('postgresql://neondb_owner:npg_qBXg9wN8MpOv@ep-sparkling-river-aazlr1de-pooler.westus3.azure.neon.tech/neondb?sslmode=require');
      
      const products = await sql`
        SELECT 
          id, title, description, type, category, price, 
          CASE 
            WHEN image_url LIKE 'https://drive.google.com/file/d/%' 
            THEN CONCAT('https://drive.google.com/thumbnail?id=', SUBSTRING(image_url FROM 'https://drive.google.com/file/d/(.+?)/'), '&sz=w300-h400')
            WHEN image_url LIKE 'https://lh3.googleusercontent.com/d/%' AND image_url NOT LIKE '%=w%'
            THEN CONCAT(image_url, '=w300-h400')
            ELSE image_url 
          END as "imageUrl",
          download_url as "downloadUrl", 
          preview_url as "previewUrl", duration, 
          badge, is_bestseller as "isBestseller", 
          is_new as "isNew", is_active as "isActive",
          created_at as "createdAt", updated_at as "updatedAt"
        FROM products 
        WHERE is_active = true 
        ORDER BY id DESC
      `;
      
      return res.status(200).json(products);
    } catch (error) {
      console.error('Database Error:', error);
      return res.status(500).json({ 
        error: 'Database operation failed', 
        message: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
