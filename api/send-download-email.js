const { Pool, neonConfig } = require('@neondatabase/serverless');
neonConfig.webSocketConstructor = require('ws');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Z9w3h6xGOa6n@ep-steep-dream-a58a9ykl.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

function extractGoogleDriveFileId(url) {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function generateEmailHTML(customerName, downloadLinks) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Tu compra en Audio Motívate</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
        .audio { color: #fbbf24; }
        .motivate { color: #3b82f6; }
        .product { background: #f8fafc; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .download-btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <span class="audio">Audio</span><span class="motivate">Motívate</span>
          </div>
          <h2>¡Tu compra ha sido confirmada!</h2>
        </div>
        
        <p>Hola ${customerName || 'Cliente'},</p>
        
        <p>Gracias por tu compra en Audio Motívate. Aquí tienes los enlaces de descarga para tus productos:</p>
        
        ${downloadLinks.map(link => `
          <div class="product">
            <h3>${link.title}</h3>
            <p>Tipo: ${link.type}</p>
            <a href="${link.url}" class="download-btn">Descargar Ahora</a>
            <p><small>Este enlace expira en 7 días por motivos de seguridad.</small></p>
          </div>
        `).join('')}
        
        <div class="footer">
          <p>¡Gracias por confiar en Audio Motívate!</p>
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { email, customerName, products } = req.body;

      if (!email || !products || products.length === 0) {
        return res.status(400).json({ error: 'Email y productos requeridos' });
      }

      // Get product details from database
      const productIds = products.map(p => p.id);
      const result = await pool.query(`
        SELECT id, title, type, download_url 
        FROM products 
        WHERE id = ANY($1)
      `, [productIds]);

      const downloadLinks = result.rows.map(product => ({
        title: product.title,
        type: product.type,
        url: product.download_url
      }));

      // Generate email HTML
      const emailHTML = generateEmailHTML(customerName, downloadLinks);

      // In a real implementation, you would send the email here
      // For now, we'll simulate email sending
      console.log('Email would be sent to:', email);
      console.log('Download links:', downloadLinks);

      return res.status(200).json({ 
        success: true,
        message: 'Email enviado exitosamente',
        downloadLinks 
      });

    } catch (error) {
      console.error('Send email API error:', error);
      return res.status(500).json({ 
        error: 'Error enviando email',
        message: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
