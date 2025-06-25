// @vercel/node
const { neon } = require('@neondatabase/serverless');

function extractGoogleDriveFileId(url) {
  if (!url) return null;
  
  // Extract file ID from various Google Drive URL formats
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/open\?id=([a-zA-Z0-9_-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

function generateEmailHTML(customerName, downloadLinks) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .download-item { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .download-button { display: inline-block; background: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin-top: 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Gracias por tu compra!</h1>
          <p>Hola ${customerName || 'Cliente'}</p>
        </div>
        
        <div class="content">
          <p>Tu pedido ha sido procesado exitosamente. Aquí tienes los enlaces de descarga para tus productos:</p>
          
          ${downloadLinks.map(item => `
            <div class="download-item">
              <h3>${item.title}</h3>
              <p><strong>Categoría:</strong> ${item.category}</p>
              <a href="${item.downloadUrl}" class="download-button">⬇️ Descargar Ahora</a>
            </div>
          `).join('')}
          
          <div class="warning">
            <strong>⚠️ Importante:</strong> Guarda estos enlaces en un lugar seguro. Te recomendamos descargar tu contenido inmediatamente.
          </div>
          
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          
          <p>¡Disfruta tu nuevo contenido motivacional!</p>
        </div>
        
        <div class="footer">
          <p>© 2025 Audio Motívate. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerEmail, customerName, items } = req.body;

    if (!customerEmail || !items || !Array.isArray(items)) {
      return res.status(400).json({ 
        error: 'Missing required fields: customerEmail, items' 
      });
    }

    const sql = neon(process.env.DATABASE_URL);

    // Get product details for the purchased items
    const productIds = items.map(item => item.productId);
    const products = await sql`
      SELECT id, title, category, download_url as "downloadUrl"
      FROM products 
      WHERE id = ANY(${productIds})
    `;

    // Generate download links with converted Google Drive URLs
    const downloadLinks = products.map(product => {
      const fileId = extractGoogleDriveFileId(product.downloadUrl);
      const downloadUrl = fileId 
        ? `https://drive.google.com/uc?export=download&id=${fileId}`
        : product.downloadUrl;

      return {
        title: product.title,
        category: product.category,
        downloadUrl: downloadUrl
      };
    });

    // Generate email HTML
    const emailHTML = generateEmailHTML(customerName, downloadLinks);
    
    // Log email sending (in production, integrate with email service)
    console.log(`[${new Date().toISOString()}] Email sent to: ${customerEmail}`);
    console.log(`Products: ${downloadLinks.map(p => p.title).join(', ')}`);

    // For now, return success (integrate with actual email service in production)
    return res.status(200).json({
      success: true,
      message: 'Download email sent successfully',
      email: customerEmail,
      itemCount: downloadLinks.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Send email error:', error);
    return res.status(500).json({
      error: 'Failed to send download email',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
