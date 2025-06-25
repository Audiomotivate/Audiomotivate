const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

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
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin-bottom: 10px;">Audio Motívate</h1>
        <h2 style="color: #16a34a; margin-top: 0;">¡Gracias por tu compra!</h2>
      </div>
      
      <p>Hola ${customerName || 'Cliente'},</p>
      
      <p>Tu compra se ha procesado exitosamente. Aquí tienes los enlaces de descarga para tus productos:</p>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        ${downloadLinks.map(link => `
          <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 6px; border-left: 4px solid #2563eb;">
            <h3 style="margin: 0 0 10px 0; color: #1e40af;">${link.title}</h3>
            <a href="${link.url}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Descargar Ahora</a>
          </div>
        `).join('')}
      </div>
      
      <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold; color: #92400e;">⏰ Enlaces válidos por 7 días</p>
        <p style="margin: 5px 0 0 0; color: #92400e;">Descarga tus productos antes de que expiren los enlaces.</p>
      </div>
      
      <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; margin: 0;">Audio Motívate - Contenido Digital Motivacional</p>
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
      return res.status(400).json({ error: 'Missing required data' });
    }

    const productIds = items.map(item => item.productId);
    const result = await pool.query(
      'SELECT id, title, download_url FROM products WHERE id = ANY($1)',
      [productIds]
    );

    const downloadLinks = result.rows.map(product => {
      const fileId = extractGoogleDriveFileId(product.download_url);
      const downloadUrl = fileId 
        ? `https://drive.google.com/uc?export=download&id=${fileId}`
        : product.download_url;

      return {
        title: product.title,
        url: downloadUrl
      };
    });

    const emailHTML = generateEmailHTML(customerName, downloadLinks);

    // In production, this would integrate with email service
    console.log('Email would be sent to:', customerEmail);
    console.log('Download links:', downloadLinks);

    return res.json({ 
      success: true, 
      message: 'Email sent successfully',
      downloadLinks: downloadLinks.length
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
};
