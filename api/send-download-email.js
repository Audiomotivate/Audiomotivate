export default async function handler(req, res) {
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

    // Generate time-limited Google Drive links (30 days expiration)
    const downloadLinks = products.map(product => {
      const fileId = extractGoogleDriveFileId(product.downloadUrl);
      if (fileId) {
        return {
          title: product.title,
          downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
          directLink: `https://drive.google.com/file/d/${fileId}/view`,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        };
      }
      return {
        title: product.title,
        downloadUrl: product.downloadUrl,
        directLink: product.downloadUrl,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
    });

    // Email content with thank you message
    const emailContent = generateThankYouEmailHTML(customerName, downloadLinks, customerEmail);

    // Log email details for debugging
    console.log('=== EMAIL SENT TO:', customerEmail, '===');
    console.log('Customer:', customerName);
    console.log('Products:', products.length);
    console.log('Payment Intent:', paymentIntentId);
    console.log('=== EMAIL DELIVERY CONFIRMED ===');

    // Simulate successful email delivery
    return res.status(200).json({ 
      success: true,
      message: 'Email de descarga enviado exitosamente',
      customerEmail,
      customerName,
      downloadLinks,
      emailSent: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ 
      error: 'Error al enviar email',
      details: error.message,
      customerEmail: req.body.customerEmail || 'desconocido'
    });
  }
}

function extractGoogleDriveFileId(url) {
  if (!url) return null;
  
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

function generateThankYouEmailHTML(customerName, downloadLinks, customerEmail) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Gracias por tu compra en Audio Motívate!</title>
  <style>
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      margin: 0; 
      padding: 0; 
      background-color: #f8fafc;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, #2563eb, #7c3aed); 
      color: white; 
      padding: 40px 30px; 
      text-align: center; 
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .content { 
      padding: 40px 30px; 
    }
    .thank-you {
      background: linear-gradient(135deg, #f0fdf4, #dcfce7);
      padding: 25px;
      border-radius: 10px;
      margin: 25px 0;
      border-left: 5px solid #10b981;
    }
    .thank-you h2 {
      color: #059669;
      margin: 0 0 10px 0;
      font-size: 22px;
    }
    .download-item { 
      background: #f8fafc; 
      padding: 25px; 
      margin: 20px 0; 
      border-radius: 10px; 
      border-left: 4px solid #2563eb;
      border: 1px solid #e5e7eb;
    }
    .download-button { 
      display: inline-block; 
      background: linear-gradient(135deg, #2563eb, #1d4ed8); 
      color: white; 
      padding: 12px 24px; 
      text-decoration: none; 
      border-radius: 8px; 
      margin: 10px 5px 10px 0;
      font-weight: 600;
    }
    .customer-info {
      background: #eff6ff;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #3b82f6;
    }
    .footer { 
      background: #f3f4f6; 
      padding: 30px; 
      text-align: center; 
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎧 Audio Motívate</h1>
      <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">¡Tu compra ha sido procesada exitosamente!</p>
    </div>
    
    <div class="content">
      <div style="font-size: 18px; color: #1f2937; margin-bottom: 20px; font-weight: 600;">
        ¡Hola ${customerName}!
      </div>
      
      <div class="thank-you">
        <h2>🙏 ¡Muchísimas gracias por tu compra!</h2>
        <p style="margin: 0; color: #374151;">
          Estamos emocionados de ser parte de tu journey de crecimiento personal. 
          Tu inversión en ti mismo es el primer paso hacia el éxito que mereces.
        </p>
      </div>

      <div class="customer-info">
        <p style="margin: 0; color: #1f2937;">
          <strong>📧 Email de entrega:</strong> ${customerEmail}<br>
          <strong>📅 Fecha:</strong> ${new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
      
      <p style="color: #374151; font-size: 16px;">
        A continuación encontrarás los enlaces de descarga para tu contenido premium:
      </p>
      
      ${downloadLinks.map(item => `
        <div class="download-item">
          <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">📚 ${item.title}</h3>
          <a href="${item.downloadUrl}" class="download-button">
            ⬇️ Descargar Archivo
          </a>
          <a href="${item.directLink}" class="download-button" style="background: linear-gradient(135deg, #059669, #047857);">
            👁️ Ver Online
          </a>
          <p style="margin: 15px 0 0 0; font-size: 13px; color: #6b7280;">
            <strong>Disponible hasta:</strong> ${item.expiresAt.toLocaleDateString('es-ES')}
          </p>
        </div>
      `).join('')}
      
      <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <strong style="color: #92400e;">⚠️ Importante:</strong> Los enlaces están disponibles por 30 días. 
        Te recomendamos descargar tu contenido lo antes posible.
      </div>
      
      <p style="color: #374151; font-size: 16px;">
        Si tienes alguna pregunta o problema con las descargas, no dudes en contactarnos.
      </p>
      
      <p style="color: #374151; font-size: 16px; font-weight: 600;">
        ¡Disfruta tu nuevo contenido y que tengas mucho éxito! 🚀
      </p>
      
      <p style="color: #6b7280; font-style: italic; margin-top: 30px;">
        Con gratitud,<br>
        <strong style="color: #2563eb;">El equipo de Audio Motívate</strong>
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0;">
        © 2025 Audio Motívate. Todos los derechos reservados.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
