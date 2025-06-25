// @vercel/node
const { Pool, neonConfig } = require('@neondatabase/serverless');
neonConfig.webSocketConstructor = require('ws');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Z9w3h6xGOa6n@ep-steep-dream-a58a9ykl.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

function getSessionId(req) {
  return req.headers['x-session-id'] || 'anonymous';
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-session-id');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // PRODUCTS API
    if (pathname === '/api/products') {
      if (req.method === 'GET') {
        const result = await pool.query(`
          SELECT id, title, price, image_url as "imageUrl", preview_url as "previewUrl", 
                 download_url as "downloadUrl", type, category, duration, rating, badge
          FROM products WHERE is_active = true ORDER BY created_at DESC
        `);
        return res.status(200).json(result.rows);
      }
    }

    // ADMIN PRODUCTS API
    if (pathname === '/api/admin/products') {
      if (req.method === 'GET') {
        const result = await pool.query(`
          SELECT id, title, price, image_url as "imageUrl", preview_url as "previewUrl", 
                 download_url as "downloadUrl", type, category, duration, rating, badge, is_active as "isActive"
          FROM products ORDER BY created_at DESC
        `);
        return res.status(200).json(result.rows);
      }
      
      if (req.method === 'POST') {
        const { title, price, imageUrl, previewUrl, downloadUrl, type, category, duration, rating, badge, isActive } = req.body;
        const result = await pool.query(`
          INSERT INTO products (title, price, image_url, preview_url, download_url, type, category, duration, rating, badge, is_active, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()) RETURNING *
        `, [title, price, imageUrl, previewUrl, downloadUrl, type, category, duration, rating, badge, isActive]);
        return res.status(201).json(result.rows[0]);
      }
    }

    // TESTIMONIALS API
    if (pathname === '/api/testimonials') {
      if (req.method === 'GET') {
        const result = await pool.query('SELECT * FROM testimonials ORDER BY created_at DESC');
        return res.status(200).json(result.rows);
      }
    }

    // CART API
    if (pathname === '/api/cart') {
      if (req.method === 'GET') {
        const sessionId = getSessionId(req);
        const cartQuery = `
          SELECT 
            ci.id,
            ci.product_id as "productId",
            ci.quantity,
            p.id as "product.id",
            p.title as "product.title",
            p.price as "product.price",
            p.image_url as "product.imageUrl"
          FROM cart_items ci
          JOIN carts c ON ci.cart_id = c.id
          JOIN products p ON ci.product_id = p.id
          WHERE c.session_id = $1
        `;
        
        const result = await pool.query(cartQuery, [sessionId]);
        const items = result.rows.map(row => ({
          id: row.id,
          productId: row.productId,
          quantity: row.quantity,
          product: {
            id: row['product.id'],
            title: row['product.title'],
            price: row['product.price'],
            imageUrl: row['product.imageUrl']
          }
        }));
        
        const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        return res.status(200).json({ items, total, isOpen: false });
      }
    }

    // CART ITEMS API
    if (pathname === '/api/cart-items') {
      if (req.method === 'POST') {
        const sessionId = getSessionId(req);
        const { productId, quantity = 1 } = req.body;
        
        if (!productId) {
          return res.status(400).json({ error: 'Product ID required' });
        }

        let cartResult = await pool.query('SELECT id FROM carts WHERE session_id = $1', [sessionId]);
        let cartId;
        
        if (cartResult.rows.length === 0) {
          const newCart = await pool.query(
            'INSERT INTO carts (session_id, created_at) VALUES ($1, NOW()) RETURNING id',
            [sessionId]
          );
          cartId = newCart.rows[0].id;
        } else {
          cartId = cartResult.rows[0].id;
        }

        const existingItem = await pool.query(
          'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
          [cartId, productId]
        );

        if (existingItem.rows.length > 0) {
          await pool.query(
            'UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2',
            [quantity, existingItem.rows[0].id]
          );
        } else {
          await pool.query(
            'INSERT INTO cart_items (cart_id, product_id, quantity, created_at) VALUES ($1, $2, $3, NOW())',
            [cartId, productId, quantity]
          );
        }

        return res.status(200).json({ success: true });
      }
    }

    // CHECKOUT API
    if (pathname === '/api/checkout') {
      if (req.method === 'POST') {
        const Stripe = require('stripe');
        
        if (!process.env.STRIPE_SECRET_KEY) {
          return res.status(500).json({ error: 'Payment system not configured' });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const { amount, currency = 'mxn', cartItems = [] } = req.body;

        if (!amount || amount <= 0) {
          return res.status(400).json({ error: 'Invalid amount' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount),
          currency: currency.toLowerCase(),
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'never'
          },
          setup_future_usage: null,
          metadata: {
            cart_items: JSON.stringify(cartItems),
            timestamp: new Date().toISOString()
          }
        });

        return res.status(200).json({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id
        });
      }
    }

    return res.status(404).json({ error: 'Endpoint not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
