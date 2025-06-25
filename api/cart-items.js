const { Pool, neonConfig } = require('@neondatabase/serverless');
neonConfig.webSocketConstructor = require('ws');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Z9w3h6xGOa6n@ep-steep-dream-a58a9ykl.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

function getSessionId(req) {
  return req.headers['x-session-id'] || 'anonymous';
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-session-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sessionId = getSessionId(req);

  try {
    if (req.method === 'POST') {
      const { productId, quantity = 1 } = req.body;

      if (!productId) {
        return res.status(400).json({ error: 'Product ID requerido' });
      }

      // Verificar si ya existe
      const existingResult = await pool.query(
        'SELECT id, quantity FROM cart_items WHERE session_id = $1 AND product_id = $2',
        [sessionId, productId]
      );

      if (existingResult.rows.length > 0) {
        // Actualizar cantidad
        const newQuantity = existingResult.rows[0].quantity + quantity;
        await pool.query(
          'UPDATE cart_items SET quantity = $1 WHERE id = $2',
          [newQuantity, existingResult.rows[0].id]
        );
      } else {
        // Insertar nuevo
        await pool.query(
          'INSERT INTO cart_items (session_id, product_id, quantity) VALUES ($1, $2, $3)',
          [sessionId, productId, quantity]
        );
      }

      return res.status(200).json({ success: true });
    }

    if (req.method === 'PUT') {
      const { itemId, quantity } = req.body;

      if (!itemId || quantity === undefined) {
        return res.status(400).json({ error: 'Item ID y cantidad requeridos' });
      }

      if (quantity <= 0) {
        await pool.query('DELETE FROM cart_items WHERE id = $1 AND session_id = $2', [itemId, sessionId]);
      } else {
        await pool.query(
          'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND session_id = $3',
          [quantity, itemId, sessionId]
        );
      }

      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { itemId } = req.body;

      if (!itemId) {
        return res.status(400).json({ error: 'Item ID requerido' });
      }

      await pool.query('DELETE FROM cart_items WHERE id = $1 AND session_id = $2', [itemId, sessionId]);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Cart items API error:', error);
    return res.status(500).json({ 
      error: 'Database error',
      message: error.message 
    });
  }
};
