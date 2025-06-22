// @vercel/node
const { neon } = require('@neondatabase/serverless');

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    if (req.method === 'GET') {
      const products = await sql`
        SELECT 
          id, title, description, type, category, price, 
          image_url as "imageUrl", download_url as "downloadUrl", 
          preview_url as "previewUrl", duration, 
          badge, is_bestseller as "isBestseller", 
          is_new as "isNew", is_active as "isActive",
          created_at as "createdAt", updated_at as "updatedAt"
        FROM products 
        WHERE is_active = true 
        ORDER BY id DESC
      `;
      return res.status(200).json(products);
    }

    if (req.method === 'POST') {
      const { 
        title, description, type, category, price, 
        imageUrl, downloadUrl, previewUrl, duration, 
        badge, isBestseller, isNew 
      } = req.body;
      
      const [product] = await sql`
        INSERT INTO products (
          title, description, type, category, price, 
          image_url, download_url, preview_url, duration, 
          badge, is_bestseller, is_new, is_active
        )
        VALUES (
          ${title}, ${description}, ${type}, ${category}, ${price || 0}, 
          ${imageUrl || ''}, ${downloadUrl || ''}, ${previewUrl || ''}, ${duration || '45:30'}, 
          ${badge || ''}, ${isBestseller || false}, ${isNew || false}, true
        )
        RETURNING 
          id, title, description, type, category, price,
          image_url as "imageUrl", download_url as "downloadUrl",
          preview_url as "previewUrl", duration, badge,
          is_bestseller as "isBestseller", is_new as "isNew",
          is_active as "isActive", created_at as "createdAt",
          updated_at as "updatedAt"
      `;
      
      return res.status(201).json(product);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const updateData = req.body;
      
      const [product] = await sql`
        UPDATE products 
        SET title = ${updateData.title},
            description = ${updateData.description},
            type = ${updateData.type},
            category = ${updateData.category},
            price = ${updateData.price},
            image_url = ${updateData.imageUrl},
            download_url = ${updateData.downloadUrl},
            preview_url = ${updateData.previewUrl},
            duration = ${updateData.duration},
            badge = ${updateData.badge},
            is_bestseller = ${updateData.isBestseller},
            is_new = ${updateData.isNew},
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING 
          id, title, description, type, category, price,
          image_url as "imageUrl", download_url as "downloadUrl",
          preview_url as "previewUrl", duration, badge,
          is_bestseller as "isBestseller", is_new as "isNew",
          is_active as "isActive", created_at as "createdAt",
          updated_at as "updatedAt"
      `;
      
      return res.status(200).json(product);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      await sql`
        UPDATE products 
        SET is_active = false, updated_at = NOW()
        WHERE id = ${id}
      `;
      
      return res.status(200).json({ success: true });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Database connection error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
