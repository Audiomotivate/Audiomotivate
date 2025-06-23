module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authenticated = !!(req.session && req.session.isAuthenticated);
  res.json({ authenticated });
};
