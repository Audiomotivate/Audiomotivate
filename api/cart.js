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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-session-id, Cookie');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log(`${req.method} /api/cart`);

  try {
    // Try to get session ID from multiple sources
    const sessionId = req.headers['x-session-id'] || 
                     req.headers['X-Session-Id'] || 
                     req.cookies?.['session-id'] ||
                     'browser-session-' + (req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown');
    
    console.log(`Using session ID: ${sessionId}`);
    
    if (req.method === 'GET') {
      // Get cart with items
      const cartResult = await pool.query('SELECT id, session_id FROM carts WHERE session_id = $1', [sessionId]);
      
      if (cartResult.rows.length === 0) {
        // Return empty cart structure that matches frontend expectations
        return res.json({ 
          cart: null,
          items: [] 
        });
      }
      
      const cart = cartResult.rows[0];
      
      const itemsResult = await pool.query(`
        SELECT 
          ci.id,
          ci.product_id as "productId",
          ci.quantity,
          p.id as "product_id",
          p.title as "product_title",
          p.price as "product_price",
          p.image_url as "product_imageUrl",
          p.type as "product_type",
          p.category as "product_category",
          p.duration as "product_duration"
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = $1
      `, [cart.id]);
      
      // Transform data to match frontend expectations
      const items = itemsResult.rows.map(row => ({
        id: row.id,
        quantity: row.quantity,
        product: {
          id: row.product_id,
          title: row.product_title,
          price: row.product_price,
          imageUrl: convertGoogleDriveUrl(row.product_imageUrl),
          type: row.product_type,
          category: row.product_category,
          duration: row.product_duration
        }
      }));
      
      console.log(`Found ${items.length} cart items for session ${sessionId}`);
      return res.json({ 
        cart: {
          id: cart.id,
          sessionId: cart.session_id
        },
        items: items
      });
      
    } else if (req.method === 'POST') {
      const { productId, quantity = 1 } = req.body;
      
      if (!productId) {
        return res.status(400).json({ error: 'Product ID required' });
      }
      
      // Get or create cart
      let cartResult = await pool.query('SELECT id FROM carts WHERE session_id = $1', [sessionId]);
      let cartId;
      
      if (cartResult.rows.length === 0) {
        const newCart = await pool.query(
          'INSERT INTO carts (session_id) VALUES ($1) RETURNING id',
          [sessionId]
        );
        cartId = newCart.rows[0].id;
      } else {
        cartId = cartResult.rows[0].id;
      }
      
      // Check if item already exists in cart
      const existingItem = await pool.query(
        'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cartId, productId]
      );
      
      if (existingItem.rows.length > 0) {
        // Update quantity
        const newQuantity = existingItem.rows[0].quantity + quantity;
        await pool.query(
          'UPDATE cart_items SET quantity = $1 WHERE id = $2',
          [newQuantity, existingItem.rows[0].id]
        );
      } else {
        // Add new item
        await pool.query(
          'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
          [cartId, productId, quantity]
        );
      }
      
      console.log(`Added product ${productId} to cart for session ${sessionId}`);
      return res.json({ success: true });
      
    } else if (req.method === 'PUT') {
      const { productId, quantity } = req.body;
      
      if (!productId || quantity < 0) {
        return res.status(400).json({ error: 'Invalid product ID or quantity' });
      }
      
      const result = await pool.query(`
        UPDATE cart_items 
        SET quantity = $3
        FROM carts 
        WHERE cart_items.cart_id = carts.id 
          AND carts.session_id = $1 
          AND cart_items.product_id = $2
      `, [sessionId, productId, quantity]);
      
      console.log(`Updated quantity for product ${productId} to ${quantity}`);
      return res.json({ success: true });
      
    } else if (req.method === 'DELETE') {
      const { productId } = req.query;
      
      if (productId) {
        // Remove specific item
        await pool.query(`
          DELETE FROM cart_items 
          USING carts 
          WHERE cart_items.cart_id = carts.id 
            AND carts.session_id = $1 
            AND cart_items.product_id = $2
        `, [sessionId, productId]);
        
        console.log(`Removed product ${productId} from cart`);
      } else {
        // Clear entire cart
        await pool.query(`
          DELETE FROM cart_items 
          USING carts 
          WHERE cart_items.cart_id = carts.id 
            AND carts.session_id = $1
        `, [sessionId]);
        
        console.log(`Cleared cart for session ${sessionId}`);
      }
      
      return res.json({ success: true });
      
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Cart API error:', error);
    return res.status(500).json({ 
      error: 'Cart operation failed',
      details: error.message 
    });
  }
}
