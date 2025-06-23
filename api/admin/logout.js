module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Clear session
  if (req.session) {
    req.session.destroy();
  }
  
  res.json({ success: true, message: 'Logout successful' });
};
