export default async function handler(req, res) {
  try {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'GET') {
      // Datos reales del día 24 para testing
      const products = [
        {
          id: 1001,
          title: "El Único Audiolibro que Necesitas para Dominar la Energía Cuántica",
          description: "Descubre los secretos de la física cuántica aplicada al desarrollo personal. Este audiolibro te llevará en un viaje transformador...",
          price: 499,
          imageUrl: "https://lh3.googleusercontent.com/d/1BxYzQCJ5KvLMNOPQRSTUVWXYZ=w1000",
          downloadUrl: "https://lh3.googleusercontent.com/d/1BxYzQCJ5KvLMNOPQRSTUVWXYZ",
          type: "audiobook",
          duration: "2:15:30",
          category: "Desarrollo Personal",
          badge: "Premium",
          isActive: true
        },
        {
          id: 17,
          title: "Técnicas Avanzadas de Visualización",
          description: "Aprende las técnicas más poderosas de visualización creativa...",
          price: 399,
          imageUrl: "https://lh3.googleusercontent.com/d/1CdEfGHI6LwNOPQRSTUVWXYZ=w1000",
          downloadUrl: "https://lh3.googleusercontent.com/d/1CdEfGHI6LwNOPQRSTUVWXYZ", 
          type: "audio",
          duration: "1:45:20",
          category: "Técnicas Mentales",
          badge: "Nuevo",
          isActive: true
        },
        {
          id: 18,
          title: "Guía Completa de Manifestación",
          description: "La guía definitiva para manifestar la vida de tus sueños...",
          price: 299,
          imageUrl: "https://lh3.googleusercontent.com/d/1EfGhIJ7MxOPQRSTUVWXYZ=w1000",
          downloadUrl: "https://lh3.googleusercontent.com/d/1EfGhIJ7MxOPQRSTUVWXYZ",
          type: "guide",
          duration: "85 páginas",
          category: "Guías Prácticas",
          badge: "",
          isActive: true
        },
        {
          id: 3,
          title: "Scripts de Afirmaciones Poderosas",
          description: "Colección de scripts diseñados para reprogramar tu mente...",
          price: 199,
          imageUrl: "https://lh3.googleusercontent.com/d/1GhIjKL8NyPQRSTUVWXYZ=w1000",
          downloadUrl: "https://lh3.googleusercontent.com/d/1GhIjKL8NyPQRSTUVWXYZ",
          type: "pdf",
          duration: "42 páginas",
          category: "Scripts",
          badge: "",
          isActive: true
        }
      ];
      
      return res.status(200).json(products);
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Products API Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
