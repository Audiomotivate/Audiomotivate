import nodemailer from 'nodemailer';

// Función para extraer ID de Google Drive
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

// Función para generar HTML del email
function generateEmailHTML(customerName, downloadLinks) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Tu compra en Audio Motívate</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">
          <span style="color: #ffd700;">Audio</span><span style="color: white;">Motívate</span>
        </h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Tu transformación personal comienza ahora</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #667eea; margin-bottom: 20px;">¡Hola ${customerName}!</h2>
        
        <p style="margin-bottom: 20px;">¡Gracias por tu compra! Tu pago se ha procesado exitosamente y ya tienes acceso a tu contenido premium.</p>
        
        <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <h3 style="color: #667eea; margin-top: 0;">📥 Enlaces de Descarga</h3>
          <p style="color: #666; margin-bottom: 15px;">Descarga tu contenido haciendo clic en los enlaces:</p>
          
          ${downloadLinks.map(link => `
            <div style="margin: 15px 0; padding: 15px; background: white; border-radius: 6px; border: 1px solid #e0e0e0;">
              <h4 style="margin: 0 0 10px 0; color: #333;">${link.title}</h4>
              <a href="${link.url}" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; transition: transform 0.2s;">
                📱 Descargar Ahora
              </a>
            </div>
          `).join('')}
        </div>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
          <p style="margin: 0; color: #856404;"><strong>⏰ Importante:</strong> Estos enlaces estarán disponibles por 30 días. Te recomendamos descargar el contenido pronto.</p>
        </div>
        
        <div style="margin: 30px 0; text-align: center;">
          <h3 style="color: #667eea;">🌟 Comienza tu transformación personal</h3>
          <p>El contenido que has adquirido ha sido diseñado para ayudarte a alcanzar tus metas y mejorar tu vida.</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <div style="text-align: center; color: #666; font-size: 14px;">
          <p>¿Necesitas ayuda? Contáctanos respondiendo a este email.</p>
          <p style="margin: 20px 0;">
            <strong style="color: #667eea;">Audio Motívate</strong><br>
            Tu plataforma de desarrollo personal
          </p>
          <p style="font-size: 12px; color: #999;">
            Este email contiene enlaces de descarga personalizados. No compartas estos enlaces.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerEmail, customerName, products, paymentIntentId } = req.body;

    if (!customerEmail || !customerName || !products) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Procesar enlaces de descarga
    const downloadLinks = products.map(product => {
      const fileId = extractGoogleDriveFileId(product.downloadUrl);
      let downloadUrl = product.downloadUrl;
      
      if (fileId) {
        downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      }
      
      return {
        title: product.title,
        url: downloadUrl
      };
    });

    // Configurar nodemailer (usando variables de entorno)
    const transporter = nodemailer.createTransporter({
      service: 'gmail', // o tu proveedor de email
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const htmlContent = generateEmailHTML(customerName, downloadLinks);

    const mailOptions = {
      from: `"Audio Motívate" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `🎉 Tu compra en Audio Motívate - Enlaces de descarga`,
      html: htmlContent
    };

    // Enviar email
    await transporter.sendMail(mailOptions);

    console.log(`Email sent successfully to ${customerEmail} for payment ${paymentIntentId}`);

    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error sending download email:', error);
    
    return res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
