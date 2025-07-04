import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const sql = neon('postgresql://neondb_owner:npg_qBXg9wN8MpOv@ep-sparkling-river-aazlr1de-pooler.westus3.azure.neon.tech/neondb?sslmode=require');

    if (req.method === 'GET') {
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
        ORDER BY created_at DESC
      `;
      
      return res.status(200).json(products);
    }

    if (req.method === 'POST') {
      const { title, description, type, category, price, imageUrl, downloadUrl, previewUrl, duration, badge, isActive = true } = req.body;
      
      const [product] = await sql`
        INSERT INTO products (title, description, type, category, price, image_url, download_url, preview_url, duration, badge, is_active)
        VALUES (${title}, ${description}, ${type}, ${category}, ${price}, ${imageUrl}, ${downloadUrl}, ${previewUrl}, ${duration}, ${badge}, ${isActive})
        RETURNING *
      `;
      
      return res.status(201).json(product);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const { title, description, type, category, price, imageUrl, downloadUrl, previewUrl, duration, badge, isActive } = req.body;
      
      const [product] = await sql`
        UPDATE products 
        SET title = ${title}, description = ${description}, type = ${type}, 
            category = ${category}, price = ${price}, image_url = ${imageUrl}, 
            download_url = ${downloadUrl}, preview_url = ${previewUrl}, 
            duration = ${duration}, badge = ${badge}, is_active = ${isActive},
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      
      return res.status(200).json(product);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      await sql`DELETE FROM products WHERE id = ${id}`;
      
      return res.status(200).json({ message: 'Product deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Admin API Error:', error);
    return res.status(500).json({ 
      error: 'Database operation failed',
      message: error.message
    });
  }
}
