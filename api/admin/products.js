import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL
});

function convertGoogleDriveUrl(url) {
  if (!url) return url;
  
  if (url.includes('drive.google.com/file/d/')) {
    const fileId = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)[1];
    return `https://lh3.googleusercontent.com/d/${fileId}=w1000`;
  }
  
  return url;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET - List all products
    if (req.method === 'GET') {
      const result = await pool.query(`
        SELECT id, title, description, price, "imageUrl", "downloadUrl", type, duration, category, badge, "isActive"
        FROM products 
        ORDER BY id ASC
      `);
      
      const products = result.rows.map(product => ({
        ...product,
        imageUrl: convertGoogleDriveUrl(product.imageUrl),
        downloadUrl: convertGoogleDriveUrl(product.downloadUrl)
      }));
      
      return res.status(200).json(products);
    }

    // POST - Create new product
    if (req.method === 'POST') {
      const { title, description, price, imageUrl, downloadUrl, type, duration, category, badge, isActive, id } = req.body;
      
      let query, values;
      
      if (id) {
        // Insert with specific ID
        query = `
          INSERT INTO products (id, title, description, price, "imageUrl", "downloadUrl", type, duration, category, badge, "isActive")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `;
        values = [id, title, description, price, convertGoogleDriveUrl(imageUrl), convertGoogleDriveUrl(downloadUrl), type, duration, category, badge, isActive !== false];
      } else {
        // Auto-increment ID
        query = `
          INSERT INTO products (title, description, price, "imageUrl", "downloadUrl", type, duration, category, badge, "isActive")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *
        `;
        values = [title, description, price, convertGoogleDriveUrl(imageUrl), convertGoogleDriveUrl(downloadUrl), type, duration, category, badge, isActive !== false];
      }
      
      const result = await pool.query(query, values);
      return res.status(201).json(result.rows[0]);
    }

    // PUT - Update product
    if (req.method === 'PUT') {
      const { id, title, description, price, imageUrl, downloadUrl, type, duration, category, badge, isActive } = req.body;
      
      const result = await pool.query(`
        UPDATE products 
        SET title = $2, description = $3, price = $4, "imageUrl" = $5, "downloadUrl" = $6, 
            type = $7, duration = $8, category = $9, badge = $10, "isActive" = $11
        WHERE id = $1
        RETURNING *
      `, [id, title, description, price, convertGoogleDriveUrl(imageUrl), convertGoogleDriveUrl(downloadUrl), type, duration, category, badge, isActive !== false]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      return res.status(200).json(result.rows[0]);
    }

    // DELETE - Delete product
    if (req.method === 'DELETE') {
      const { id } = req.body;
      
      const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      return res.status(200).json({ message: 'Product deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Admin Products API Error:', error);
    return res.status(500).json({ error: 'Database error', details: error.message });
  }
}
