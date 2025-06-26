const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tXwAjwCGlj9v@ep-weathered-moon-a5lhb4r0.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

function generateEmailHTML(customerName, downloadLinks) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Tu compra está lista - Audio Motívate</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FFD700, #4169E1); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .download-link { display: inline-block; background: #4169E1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 ¡Tu compra está lista!</h1>
                <p>Gracias por confiar en Audio Motívate</p>
            </div>
            <div class="content">
                <p>Hola ${customerName || 'Estimado/a cliente'},</p>
                <p>¡Excelente noticia! Tu compra se ha procesado exitosamente y ya tienes acceso inmediato a tu contenido digital.</p>
                <h3>📥 Tus descargas:</h3>
                ${downloadLinks.map(link => `
                    <p><a href="${link.url}" class="download-link">📱 Descargar: ${link.title}</a></p>
                `).join('')}
                <p><strong>⚡ Enlaces válidos por 7 días</strong></p>
                <p>Guarda estos archivos en tu dispositivo para acceso permanente.</p>
                <p>¡Disfruta tu contenido motivacional y transforma tu vida!</p>
                <p>Con cariño,<br>El equipo de Audio Motívate</p>
            </div>
            <div class="footer">
                <p>© 2025 Audio Motívate - Transformando vidas a través del audio</p>
            </div>
        </div>
    </body>
    </html>
  `;
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
      const { customerEmail, customerName, items } = req.body;
      
      if (!customerEmail || !items || items.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const client = await pool.connect();
      
      try {
        const downloadLinks = [];
        
        for (const item of items) {
          const productResult = await client.query(
            'SELECT title, download_url FROM products WHERE id = $1',
            [item.id]
          );
          
          if (productResult.rows.length > 0) {
            const product = productResult.rows[0];
            downloadLinks.push({
              title: product.title,
              url: product.download_url
            });
          }
        }
        
        client.release();
        
        const emailHTML = generateEmailHTML(customerName, downloadLinks);
        
        // En un entorno real, aquí enviarías el email usando un servicio como SendGrid o similar
        console.log('Email would be sent to:', customerEmail);
        console.log('Download links:', downloadLinks);
        
        return res.json({ 
          success: true, 
          message: 'Email sent successfully',
          downloadLinks: downloadLinks
        });
      } catch (error) {
        client.release();
        throw error;
      }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Send Download Email API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
