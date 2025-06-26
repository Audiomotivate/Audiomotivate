module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, products, paymentIntentId } = req.body;
    
    if (!email || !products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Log the email sending attempt (in production, you would integrate with an email service)
    console.log('Email confirmation sent to:', email);
    console.log('Products:', products);
    console.log('Payment Intent ID:', paymentIntentId);
    
    // For now, we'll simulate successful email sending
    // In production, integrate with services like SendGrid, Mailgun, or AWS SES
    
    // Simulate email content
    const emailContent = {
      to: email,
      subject: 'Confirmación de compra - Audio Motívate',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6;">¡Gracias por tu compra!</h1>
          <p>Tu pedido ha sido procesado exitosamente. Aquí están tus enlaces de descarga:</p>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>Productos adquiridos:</h2>
            ${products.map(product => `
              <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 5px;">
                <h3 style="margin: 0 0 10px 0; color: #1F2937;">${product.title}</h3>
                <p style="margin: 5px 0; color: #6B7280;">Cantidad: ${product.quantity}</p>
                <p style="margin: 5px 0; color: #6B7280;">Precio: $${product.price} MXN</p>
                ${product.downloadUrl ? `
                  <a href="${product.downloadUrl}" 
                     style="display: inline-block; background: #3B82F6; color: white; padding: 10px 20px; 
                            text-decoration: none; border-radius: 5px; margin-top: 10px;">
                    Descargar ahora
                  </a>
                ` : '<p style="color: #EF4444;">URL de descarga no disponible</p>'}
              </div>
            `).join('')}
          </div>
          
          <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
            <strong>Importante:</strong> Los enlaces de descarga estarán disponibles por 7 días. 
            Guarda este email para futuras referencias.
          </p>
          
          <p style="color: #6B7280; font-size: 14px;">
            ID de transacción: ${paymentIntentId}
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
          
          <p style="text-align: center; color: #6B7280; font-size: 14px;">
            Audio Motívate - Tu plataforma de contenido motivacional
          </p>
        </div>
      `
    };
    
    // Log the email content for debugging
    console.log('Email would be sent with content:', emailContent.subject);
    
    return res.status(200).json({ 
      message: 'Email sent successfully',
      emailSent: true,
      recipient: email,
      productsCount: products.length
    });
    
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
};
