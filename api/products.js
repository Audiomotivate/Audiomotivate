const { Pool, neonConfig } = require('@neondatabase/serverless');
neonConfig.webSocketConstructor = require('ws');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Z9w3h6xGOa6n@ep-steep-dream-a58a9ykl.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

function convertGoogleDriveUrl(url) {
  if (!url) return url;
  
  // If it's already a thumbnail URL, return as is
  if (url.includes('thumbnail')) return url;
  
  // Convert Google Drive share URL to thumbnail
  if (url.includes('drive.google.com/file/d/')) {
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch) {
      return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w300-h400`;
    }
  }
  
  // If it's already lh3.googleusercontent.com, return as is
  if (url.includes('lh3.googleusercontent.com')) return url;
  
  return url;
}

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
        SELECT 
          id, title, description, type, category, price, 
          image_url, duration, is_active, badge, 
          download_url, preview_url, is_bestseller, is_new,
          created_at, updated_at, rating
        FROM products 
        WHERE is_active = true 
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
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Database connection error',
      message: error.message 
    });
  }
};
