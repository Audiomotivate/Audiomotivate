const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tXwAjwCGlj9v@ep-weathered-moon-a5lhb4r0.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

// Utility function to convert Google Drive URLs
function convertGoogleDriveUrl(url) {
  if (!url) return url;
  const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (fileIdMatch) {
    const fileId = fileIdMatch[1];
    return `https://lh3.googleusercontent.com/d/${fileId}=w400-h600-c`;
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

  const { method, query } = req;
  const path = req.url.replace('/api', '');

  try {
    // PRODUCTS ROUTES
    if (path === '/products' || path === '/products/') {
      if (method === 'GET') {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM products WHERE is_active = true ORDER BY id');
        client.release();
        
        const products = result.rows.map(product => ({
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price,
          category: product.category,
          imageUrl: convertGoogleDriveUrl(product.image_url),
          previewUrl: product.preview_url,
          downloadUrl: product.download_url,
          duration: product.duration,
          badge: product.badge,
          isActive: product.is_active,
          createdAt: product.created_at
        }));
        
        return res.json(products);
      }
    }

    // SINGLE PRODUCT ROUTE
    if (path.startsWith('/products/') && path !== '/products/') {
      const productId = path.split('/')[2];
      if (method === 'GET') {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM products WHERE id = $1 AND is_active = true', [productId]);
        client.release();
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Product not found' });
        }
        
        const product = result.rows[0];
        return res.json({
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price,
          category: product.category,
          imageUrl: convertGoogleDriveUrl(product.image_url),
          previewUrl: product.preview_url,
          downloadUrl: product.download_url,
          duration: product.duration,
          badge: product.badge,
          isActive: product.is_active,
          createdAt: product.created_at
        });
      }
    }

    // TESTIMONIALS ROUTE
    if (path === '/testimonials' || path === '/testimonials/') {
      if (method === 'GET') {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM testimonials ORDER BY id');
        client.release();
        return res.json(result.rows);
      }
    }

    // CART ROUTES
    if (path === '/cart' || path === '/cart/') {
      if (method === 'GET') {
        const sessionId = req.headers['x-session-id'] || 'anonymous';
        const client = await pool.connect();
        
        const cartResult = await client.query(
          `SELECT c.id, ci.id as item_id, ci.product_id, ci.quantity, 
                  p.title, p.price, p.image_url, p.category
           FROM carts c
           JOIN cart_items ci ON c.id = ci.cart_id
           JOIN products p ON ci.product_id = p.id
           WHERE c.session_id = $1`,
          [sessionId]
        );
        
        client.release();
        
        const items = cartResult.rows.map(row => ({
          id: row.item_id,
          productId: row.product_id,
          quantity: row.quantity,
          product: {
            id: row.product_id,
            title: row.title,
            price: row.price,
            imageUrl: convertGoogleDriveUrl(row.image_url),
            category: row.category
          }
        }));
        
        const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        
        return res.json({ items, total });
      }
    }

    // CART ITEMS ROUTE
    if (path === '/cart/items' || path === '/cart/items/') {
      if (method === 'POST') {
        const { productId, quantity = 1 } = req.body;
        const sessionId = req.headers['x-session-id'] || 'anonymous';
        
        const client = await pool.connect();
        
        try {
          await client.query('BEGIN');
          
          let cartResult = await client.query('SELECT id FROM carts WHERE session_id = $1', [sessionId]);
          let cartId;
          
          if (cartResult.rows.length === 0) {
            const newCartResult = await client.query(
              'INSERT INTO carts (session_id) VALUES ($1) RETURNING id',
              [sessionId]
            );
            cartId = newCartResult.rows[0].id;
          } else {
            cartId = cartResult.rows[0].id;
          }
          
          const existingItem = await client.query(
            'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
            [cartId, productId]
          );
          
          if (existingItem.rows.length > 0) {
            await client.query(
              'UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2',
              [quantity, existingItem.rows[0].id]
            );
          } else {
            await client.query(
              'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
              [cartId, productId, quantity]
            );
          }
          
          await client.query('COMMIT');
          return res.json({ success: true });
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      }
    }

    // ADMIN PRODUCTS ROUTE
    if (path === '/admin/products' || path === '/admin/products/') {
      if (method === 'GET') {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM products ORDER BY id');
        client.release();
        
        const products = result.rows.map(product => ({
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price,
          category: product.category,
          imageUrl: convertGoogleDriveUrl(product.image_url),
          previewUrl: product.preview_url,
          downloadUrl: product.download_url,
          duration: product.duration,
          badge: product.badge,
          isActive: product.is_active,
          createdAt: product.created_at
        }));
        
        return res.json(products);
      }
      
      if (method === 'POST') {
        const { id, title, description, price, category, imageUrl, previewUrl, downloadUrl, duration, badge, isActive } = req.body;
        
        const client = await pool.connect();
        const result = await client.query(
          `INSERT INTO products (id, title, description, price, category, image_url, preview_url, download_url, duration, badge, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING *`,
          [id, title, description, price, category, imageUrl, previewUrl, downloadUrl, duration, badge, isActive]
        );
        client.release();
        
        return res.json(result.rows[0]);
      }
      
      if (method === 'PUT') {
        const { id, title, description, price, category, imageUrl, previewUrl, downloadUrl, duration, badge, isActive } = req.body;
        
        const client = await pool.connect();
        const result = await client.query(
          `UPDATE products 
           SET title = $2, description = $3, price = $4, category = $5, image_url = $6, 
               preview_url = $7, download_url = $8, duration = $9, badge = $10, is_active = $11
           WHERE id = $1
           RETURNING *`,
          [id, title, description, price, category, imageUrl, previewUrl, downloadUrl, duration, badge, isActive]
        );
        client.release();
        
        return res.json(result.rows[0]);
      }
      
      if (method === 'DELETE') {
        const { id } = req.body;
        
        const client = await pool.connect();
        await client.query('DELETE FROM products WHERE id = $1', [id]);
        client.release();
        
        return res.json({ success: true });
      }
    }

    return res.status(404).json({ error: 'Route not found' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
