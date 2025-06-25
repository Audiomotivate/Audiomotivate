const { neon } = require('@neondatabase/serverless');

function getSessionId(req) {
  return req.headers['x-session-id'] || 'anonymous';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-session-id');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const sessionId = getSessionId(req);

    if (req.method === 'GET') {
      const cartItems = await sql`
        SELECT 
          ci.id, ci.product_id as "productId", ci.quantity,
          p.id as "product.id", p.title as "product.title", 
          p.price as "product.price", p.image_url as "product.imageUrl"
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.session_id = ${sessionId}
      `;

      const items = cartItems.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: {
          id: item['product.id'],
          title: item['product.title'],
          price: item['product.price'],
          imageUrl: item['product.imageUrl']
        }
      }));

      const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

      return res.json({
        items,
        total,
        isOpen: false
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Cart API error:', error);
    return res.status(500).json({ error: 'Cart operation failed' });
  }
}
