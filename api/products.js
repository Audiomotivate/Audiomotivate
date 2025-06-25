// @vercel/node
const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    if (req.method === 'GET') {
      const products = await sql`
        SELECT 
          id, title, description, type, category, price, 
          image_url as "imageUrl", duration, is_active as "isActive", 
          badge, download_url as "downloadUrl", preview_url as "previewUrl",
          is_bestseller as "isBestseller", is_new as "isNew",
          created_at as "createdAt", updated_at as "updatedAt"
        FROM products 
        WHERE is_active = true 
        ORDER BY created_at DESC
      `;

      // Convertir URLs de Google Drive al formato correcto
      const convertedProducts = products.map(product => ({
        ...product,
        imageUrl: convertGoogleDriveUrl(product.imageUrl)
      }));

      return res.status(200).json(convertedProducts);
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({ 
      error: 'Database connection error',
      message: error.message 
    });
  }
}

function convertGoogleDriveUrl(url) {
  if (!url) return url;
  
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w300-h400`;
    }
  }
  
  if (url.includes('lh3.googleusercontent.com')) {
    return url;
  }
  
  return url;
}
