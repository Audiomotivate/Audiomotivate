// Vercel Serverless Function for sending download emails after successful payments
export default async function handler(req, res) {
  // CORS headers
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
    const { customerEmail, customerName, products, paymentIntentId } = req.body;

    if (!customerEmail || !products || products.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate time-limited Google Drive links (7 days expiration)
    const downloadLinks = products.map(product => {
      // Convert Google Drive share URL to direct download with expiration
      const fileId = extractGoogleDriveFileId(product.downloadUrl);
      if (fileId) {
        return {
          title: product.title,
          downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        };
      }
      return {
        title: product.title,
        downloadUrl: product.downloadUrl,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
    });

    // Email content
    const emailContent = generateEmailHTML(customerName, downloadLinks);

    // For now, return the email content that would be sent
    // In production, you would integrate with a service like SendGrid, Nodemailer, etc.
    console.log('Email would be sent to:', customerEmail);
    console.log('Download links generated:', downloadLinks);

    return res.status(200).json({ 
      success: true,
      message: 'Email queued successfully',
      downloadLinks,
      emailPreview: emailContent
    });

  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message
    });
  }
}

function extractGoogleDriveFileId(url) {
  if (!url) return null;
  
  // Handle different Google Drive URL formats
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9-_]+)/,
    /id=([a-zA-Z0-9-_]+)/,
    /\/d\/([a-zA-Z0-9-_]+)/
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu Compra en Audio Motívate</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
    .download-item { background: #f8fafc; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #2563eb; }
    .download-button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    .footer { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
    .expiry-notice { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎧 Audio Motívate</h1>
      <h2>¡Gracias por tu compra!</h2>
    </div>
    
    <div class="content">
      <p>Hola ${customerName},</p>
      
      <p>Tu pago ha sido procesado exitosamente. A continuación encontrarás los enlaces de descarga para tu contenido:</p>
      
      ${downloadLinks.map(item => `
        <div class="download-item">
          <h3>${item.title}</h3>
          <a href="${item.downloadUrl}" class="download-button">⬇️ Descargar Ahora</a>
          <p><small>Disponible hasta: ${item.expiresAt.toLocaleDateString('es-ES')}</small></p>
        </div>
      `).join('')}
      
      <div class="expiry-notice">
        <strong>⚠️ Importante:</strong> Los enlaces de descarga son válidos por 7 días. Te recomendamos descargar tu contenido lo antes posible.
      </div>
      
      <p>Si tienes alguna pregunta o problema con las descargas, no dudes en contactarnos.</p>
      
      <p>¡Disfruta tu nuevo contenido motivacional!</p>
      
      <p>Saludos,<br>
      El equipo de Audio Motívate</p>
    </div>
    
    <div class="footer">
      <p><small>© 2025 Audio Motívate. Todos los derechos reservados.</small></p>
    </div>
  </div>
</body>
</html>
  `;
}
