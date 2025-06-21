// Direct test with hardcoded data first
export default async function handler(req, res) {
  try {
    // Allow CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    if (req.method === 'GET') {
      // Return hardcoded products first to test API
      const products = [
        {
          id: 1001,
          title: "OBLÍGATE A ORGANIZAR TU VIDA - 10 Claves PODEROSAS",
          type: "video",
          category: "Productividad",
          price: 9900,
          imageUrl: "https://lh3.googleusercontent.com/d/example1",
          downloadUrl: "https://drive.google.com/file/d/example1",
          duration: "45:30",
          is_active: true
        },
        {
          id: 3,
          title: "No te Creas Todo lo que Piensas: Tu Mente te Engaña y No te Has Dado Cuenta",
          type: "audiobook",
          category: "Desarrollo Personal",
          price: 9900,
          imageUrl: "https://lh3.googleusercontent.com/d/example2",
          downloadUrl: "https://drive.google.com/file/d/example2",
          duration: "60:15",
          is_active: true
        },
        {
          id: 17,
          title: "El Único Audiolibro que Necesitas para Dominar la Energía Cuántica",
          type: "audiobook",
          category: "Metafisica",
          price: 9900,
          imageUrl: "https://lh3.googleusercontent.com/d/example3",
          downloadUrl: "https://drive.google.com/file/d/example3",
          duration: "52:20",
          is_active: true
        },
        {
          id: 18,
          title: "Activa tu Poder Creador - El Único Audiolibro que Necesitas para Transformar tu Realidad",
          type: "audiobook",
          category: "Metafisica",
          price: 9900,
          imageUrl: "https://lh3.googleusercontent.com/d/example4",
          downloadUrl: "https://drive.google.com/file/d/example4",
          duration: "48:45",
          is_active: true
        }
      ];
      
      res.status(200).json(products);
    } else if (req.method === 'POST') {
      // Mock successful creation
      const newProduct = {
        id: Date.now(),
        ...req.body,
        is_active: true
      };
      res.status(201).json(newProduct);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin products API error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}
