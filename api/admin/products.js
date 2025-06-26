const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Convert Google Drive URLs to direct image URLs
function convertGoogleDriveUrl(url) {
  if (!url) return null;
  
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }
  
  if (url.includes('drive.google.com/open?id=')) {
    const match = url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }
  
  return url;
}

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
      // Get all products for admin
      const result = await client.query(
        'SELECT * FROM products ORDER BY id ASC'
      );
      
      const products = result.rows.map(product => ({
        id: product.id,
        title: product.title,
        category: product.category,
        price: product.price,
        duration: product.duration,
        rating: product.rating,
        imageUrl: convertGoogleDriveUrl(product.image_url),
        previewUrl: product.preview_url,
        downloadUrl: product.download_url,
        badge: product.badge,
        isActive: product.is_active
      }));
      
      client.release();
      return res.status(200).json(products);
    }
    
    if (req.method === 'POST') {
      // Create new product
      const { id, title, category, price, duration, rating, imageUrl, previewUrl, downloadUrl, badge, isActive } = req.body;
      
      const convertedImageUrl = convertGoogleDriveUrl(imageUrl);
      
      const result = await client.query(
        `INSERT INTO products (id, title, category, price, duration, rating, image_url, preview_url, download_url, badge, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
         RETURNING *`,
        [id, title, category, price, duration, rating || 4.9, convertedImageUrl, previewUrl, downloadUrl, badge, isActive !== false]
      );
      
      const product = result.rows[0];
      const transformedProduct = {
        id: product.id,
        title: product.title,
        category: product.category,
        price: product.price,
        duration: product.duration,
        rating: product.rating,
        imageUrl: convertGoogleDriveUrl(product.image_url),
        previewUrl: product.preview_url,
        downloadUrl: product.download_url,
        badge: product.badge,
        isActive: product.is_active
      };
      
      client.release();
      return res.status(201).json(transformedProduct);
    }
    
    if (req.method === 'PUT') {
      // Update product
      const { id } = req.query;
      const { title, category, price, duration, rating, imageUrl, previewUrl, downloadUrl, badge, isActive } = req.body;
      
      const convertedImageUrl = convertGoogleDriveUrl(imageUrl);
      
      const result = await client.query(
        `UPDATE products 
         SET title = $2, category = $3, price = $4, duration = $5, rating = $6, 
             image_url = $7, preview_url = $8, download_url = $9, badge = $10, is_active = $11
         WHERE id = $1 
         RETURNING *`,
        [id, title, category, price, duration, rating, convertedImageUrl, previewUrl, downloadUrl, badge, isActive]
      );
      
      if (result.rows.length === 0) {
        client.release();
        return res.status(404).json({ error: 'Product not found' });
      }
      
      const product = result.rows[0];
      const transformedProduct = {
        id: product.id,
        title: product.title,
        category: product.category,
        price: product.price,
        duration: product.duration,
        rating: product.rating,
        imageUrl: convertGoogleDriveUrl(product.image_url),
        previewUrl: product.preview_url,
        downloadUrl: product.download_url,
        badge: product.badge,
        isActive: product.is_active
      };
      
      client.release();
      return res.status(200).json(transformedProduct);
    }
    
    if (req.method === 'DELETE') {
      // Delete product
      const { id } = req.query;
      
      const result = await client.query(
        'DELETE FROM products WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        client.release();
        return res.status(404).json({ error: 'Product not found' });
      }
      
      client.release();
      return res.status(200).json({ message: 'Product deleted successfully' });
    }
    
    client.release();
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
