const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log(`${req.method} /api/checkout`);

  try {
    if (req.method === 'POST') {
      const { amount, currency = 'mxn' } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }
      
      // For now, return a mock client_secret for testing
      // In production, this would integrate with Stripe
      const clientSecret = `pi_test_${Date.now()}_secret_test`;
      
      console.log(`Created payment intent for ${amount} ${currency.toUpperCase()}`);
      return res.json({ 
        clientSecret,
        amount,
        currency 
      });
      
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Checkout API error:', error);
    return res.status(500).json({ 
      error: 'Checkout failed',
      details: error.message 
    });
  }
};
