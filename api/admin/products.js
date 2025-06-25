const { Pool, neonConfig } = require('@neondatabase/serverless');
neonConfig.webSocketConstructor = require('ws');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Z9w3h6xGOa6n@ep-steep-dream-a58a9ykl.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

function convertGoogleDriveUrl(url) {
  if (!url) return url;
  
  if (url.includes('thumbnail')) return url;
  
  if (url.includes('drive.google.com/file/d/')) {
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch) {
      return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w300-h400`;
    }
  }
  
  if (url.includes('lh3.googleusercontent.com')) return url;
  
  return url;
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const result = await pool.query(`
        SELECT 
          id, title, description, type, category, price, 
          image_url, duration, is_active, badge, 
          download_url, preview_url, is_bestseller, is_new,
          created_at, updated_at, rating
        FROM products 
        ORDER BY created_at DESC
      `);
      
      const products = result.rows.map(product => ({
        id: product.id,
        title: product.title,
        description: product.description,
        type: product.type,
        category: product.category,
        price: product.price,
        imageUrl: convertGoogleDriveUrl(product.image_url),
        duration: product.duration,
        isActive: product.is_active,
        badge: product.badge,
        downloadUrl: product.download_url,
        previewUrl: product.preview_url,
        isBestseller: product.is_bestseller,
        isNew: product.is_new,
        rating: product.rating || 4.9,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }));
      
      return res.status(200).json(products);
    }

    if (req.method === 'POST') {
      const {
        id, title, description, type, category, price, 
        imageUrl, duration, badge, downloadUrl, previewUrl,
        isBestseller, isNew, isActive = true
      } = req.body;

      const query = id ? 
        `INSERT INTO products (id, title, description, type, category, price, image_url, duration, badge, download_url, preview_url, is_bestseller, is_new, is_active, rating, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 4.9, NOW(), NOW()) RETURNING *` :
        `INSERT INTO products (title, description, type, category, price, image_url, duration, badge, download_url, preview_url, is_bestseller, is_new, is_active, rating, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 4.9, NOW(), NOW()) RETURNING *`;

      const values = id ? 
        [id, title, description, type, category, price, imageUrl, duration, badge, downloadUrl, previewUrl, isBestseller, isNew, isActive] :
        [title, description, type, category, price, imageUrl, duration, badge, downloadUrl, previewUrl, isBestseller, isNew, isActive];

      const result = await pool.query(query, values);
      
      const product = result.rows[0];
      return res.status(201).json({
        id: product.id,
        title: product.title,
        description: product.description,
        type: product.type,
        category: product.category,
        price: product.price,
        imageUrl: convertGoogleDriveUrl(product.image_url),
        duration: product.duration,
        isActive: product.is_active,
        badge: product.badge,
        downloadUrl: product.download_url,
        previewUrl: product.preview_url,
        isBestseller: product.is_bestseller,
        isNew: product.is_new,
        rating: product.rating || 4.9,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      });
    }

    if (req.method === 'PUT') {
      const {
        id, title, description, type, category, price, 
        imageUrl, duration, badge, downloadUrl, previewUrl,
        isBestseller, isNew, isActive
      } = req.body;

      const result = await pool.query(`
        UPDATE products SET 
          title = $2, description = $3, type = $4, category = $5, price = $6,
          image_url = $7, duration = $8, badge = $9, download_url = $10, 
          preview_url = $11, is_bestseller = $12, is_new = $13, is_active = $14,
          updated_at = NOW()
        WHERE id = $1 RETURNING *
      `, [id, title, description, type, category, price, imageUrl, duration, badge, downloadUrl, previewUrl, isBestseller, isNew, isActive]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const product = result.rows[0];
      return res.status(200).json({
        id: product.id,
        title: product.title,
        description: product.description,
        type: product.type,
        category: product.category,
        price: product.price,
        imageUrl: convertGoogleDriveUrl(product.image_url),
        duration: product.duration,
        isActive: product.is_active,
        badge: product.badge,
        downloadUrl: product.download_url,
        previewUrl: product.preview_url,
        isBestseller: product.is_bestseller,
        isNew: product.is_new,
        rating: product.rating || 4.9,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      
      const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Admin products API error:', error);
    return res.status(500).json({ 
      error: 'Database error',
      message: error.message 
    });
  }
};
