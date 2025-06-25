module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const products = [
    {
      "id": 3,
      "title": "El Único Audiolibro que Necesitas para Dominar la Energía Cuántica",
      "price": 4.99,
      "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
      "category": "audiolibro",
      "duration": "49:30",
      "rating": 4.9,
      "description": "Descubre los secretos de la energía cuántica",
      "downloadUrl": "https://drive.google.com/file/d/example",
      "isActive": true,
      "badge": "Premium"
    }
  ];

  try {
    const { id } = req.query;
    
    if (id) {
      const product = products.find(p => p.id === parseInt(id));
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      return res.json(product);
    }
    
    return res.json(products);
    
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};
