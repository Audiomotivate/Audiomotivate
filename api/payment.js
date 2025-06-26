const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tXwAjwCGlj9v@ep-weathered-moon-a5lhb4r0.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;
  const path = req.url.replace('/api/payment', '');

  try {
    // CHECKOUT ROUTE
    if (path === '/checkout' || path === '/checkout/') {
      if (method === 'POST') {
        const Stripe = await import('stripe');
        const stripe = new Stripe.default(process.env.STRIPE_SECRET_KEY || 'sk_test_51QT7IbP8VwxWqZJFiMnzJUZKOZSGPkdT2ksOVo5JlXW1xzSdKvbODPAi2EwqOwxh6M91mFPEV1IYU5ZEfcn3xCaD00xLu3zCDp');

        const { items, customerInfo } = req.body;
        
        if (!items || items.length === 0) {
          return res.status(400).json({ error: 'No items in cart' });
        }

        // Calculate total amount
        const amount = items.reduce((total, item) => total + (item.price * item.quantity), 0);

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'mxn',
          metadata: {
            customer_email: customerInfo?.email || '',
            customer_name: customerInfo?.name || '',
            items: JSON.stringify(items.map(item => ({
              id: item.id,
              title: item.title,
              quantity: item.quantity,
              price: item.price
            })))
          }
        });

        return res.json({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id
        });
      }
    }

    // EMAIL SENDING ROUTE
    if (path === '/send-download-email' || path === '/send-download-email/') {
      if (method === 'POST') {
        const { customerEmail, customerName, purchasedItems } = req.body;

        // Get product details from database
        const productIds = purchasedItems.map(item => item.id);
        const client = await pool.connect();
        
        const result = await client.query(
          'SELECT * FROM products WHERE id = ANY($1)',
          [productIds]
        );
        client.release();

        const products = result.rows;
        
        // Generate download links with time expiration
        const downloadLinks = products.map(product => {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 7); // 7 days expiry
          
          return {
            title: product.title,
            downloadUrl: product.download_url,
            expiryDate: expiryDate.toLocaleDateString('es-ES')
          };
        });

        // Generate email HTML
        const emailHTML = generateEmailHTML(customerName, downloadLinks);

        // Note: In production, you would use a real email service like SendGrid, Mailgun, etc.
        // For now, we'll simulate email sending
        console.log('Email would be sent to:', customerEmail);
        console.log('Email content:', emailHTML);

        return res.json({ 
          success: true,
          message: 'Email sent successfully',
          downloadLinks: downloadLinks
        });
      }
    }

    return res.status(404).json({ error: 'Route not found' });
    
  } catch (error) {
    console.error('Payment API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to generate email HTML
function generateEmailHTML(customerName, downloadLinks) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Tu compra en Audio Motívate</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .download-item { background: white; margin: 15px 0; padding: 20px; border-radius: 8px; border-left: 4px solid #3B82F6; }
            .download-button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px; }
            .expiry-notice { background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 6px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>¡Gracias por tu compra!</h1>
                <p>Hola ${customerName || 'Cliente'}, tu contenido está listo para descargar</p>
            </div>
            <div class="content">
                <h2>Tus descargas:</h2>
                ${downloadLinks.map(link => `
                    <div class="download-item">
                        <h3>${link.title}</h3>
                        <a href="${link.downloadUrl}" class="download-button">Descargar Ahora</a>
                        <p><small>Disponible hasta: ${link.expiryDate}</small></p>
                    </div>
                `).join('')}
                
                <div class="expiry-notice">
                    <strong>⚠️ Importante:</strong> Los enlaces de descarga estarán disponibles por 7 días. 
                    Te recomendamos descargar tu contenido cuanto antes.
                </div>
                
                <p>¡Gracias por confiar en Audio Motívate para tu crecimiento personal!</p>
                
                <hr>
                <p><small>Audio Motívate - Contenido Digital Motivacional</small></p>
            </div>
        </div>
    </body>
    </html>
  `;
}
