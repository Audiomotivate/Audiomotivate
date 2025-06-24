import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Function to convert Google Drive URLs to thumbnail format
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  console.log(`GET /api/products/${id}`);

  try {
    const productId = parseInt(id, 10);
    
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    const result = await pool.query(`
      SELECT 
        id,
        title,
        description,
        type,
        category,
        price,
        image_url as "imageUrl",
        duration,
        is_active as "isActive",
        badge,
        download_url as "downloadUrl",
        preview_url as "previewUrl",
        is_bestseller as "isBestseller",
        is_new as "isNew",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM products 
      WHERE id = $1 AND is_active = true
      LIMIT 1
    `, [productId]);
    
    console.log(`Product detail query for ID ${productId}: ${result.rows.length} rows`);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Convert image URL to proper format
    const product = result.rows[0];
    product.imageUrl = convertGoogleDriveUrl(product.imageUrl);
    
    return res.json(product);
    
  } catch (error) {
    console.error('Product detail API error:', error);
    return res.status(500).json({ 
      error: 'Database operation failed',
      details: error.message 
    });
  }
}
