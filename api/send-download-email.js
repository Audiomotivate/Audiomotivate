const { Pool, neonConfig } = require('@neondatabase/serverless');
neonConfig.webSocketConstructor = require('ws');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL
});

function convertGoogleDriveUrl(url) {
  if (!url) return url;
  
  if (url.includes('drive.google.com/file/d/')) {
    const fileId = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)[1];
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  
  return url;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const { paymentIntentId, email } = req.body;
      
      if (!paymentIntentId || !email) {
        return res.status(400).json({ error: 'Payment intent ID and email are required' });
      }
      
      // Get payment intent metadata from Stripe
      const Stripe = require('stripe');
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (!paymentIntent.metadata || !paymentIntent.metadata.products) {
        return res.status(400).json({ error: 'No products found in payment' });
      }
      
      const products = JSON.parse(paymentIntent.metadata.products);
      
      // Get full product details with download URLs
      const productIds = products.map(p => p.id);
      const result = await pool.query(`
        SELECT id, title, "downloadUrl"
        FROM products 
        WHERE id = ANY($1)
      `, [productIds]);
      
      const downloadLinks = result.rows.map(product => ({
        title: product.title,
        downloadUrl: convertGoogleDriveUrl(product.downloadUrl),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      // In a real implementation, you would send an email here
      // For now, we'll just return the download links
      
      return res.status(200).json({
        message: 'Download links prepared successfully',
        email,
        downloadLinks,
        note: 'Los enlaces de descarga expiran en 7 días'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Send Download Email API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
