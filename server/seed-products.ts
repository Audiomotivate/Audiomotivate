import { db } from "./db";
import { products } from "../shared/schema";

const sampleProducts = [
  {
    title: "Mindset: La Nueva Psicología del Éxito",
    description: "Descubre cómo una mentalidad adecuada puede transformar tu vida y llevarte al éxito que siempre has deseado.",
    type: "audiobook",
    category: "Crecimiento Personal",
    price: 1999, // $19.99
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    downloadUrl: "https://example.com/download/mindset.mp3",
    duration: "3:14",
    isActive: true
  },
  {
    title: "Los 7 Hábitos de la Gente Altamente Efectiva",
    description: "Aprende los principios fundamentales que te ayudarán a ser más efectivo en todas las áreas de tu vida.",
    type: "audiobook",
    category: "Productividad", 
    price: 2499, // $24.99
    imageUrl: "https://images.unsplash.com/photo-1513171920216-2640b288471b",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    downloadUrl: "https://example.com/download/7-habitos.mp3",
    duration: "2:56",
    isActive: true
  },
  {
    title: "Cómo Superar el Miedo al Fracaso",
    description: "Técnicas probadas para enfrentar tus miedos y convertir los obstáculos en oportunidades de crecimiento.",
    type: "video",
    category: "Superación Personal",
    price: 1599, // $15.99
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    downloadUrl: "https://example.com/download/superar-miedo.mp4",
    duration: "18:45",
    isActive: true
  },
  {
    title: "Guía Completa de Desarrollo Personal",
    description: "Una guía paso a paso para transformar tu vida y alcanzar tu máximo potencial en todas las áreas.",
    type: "guide",
    category: "Crecimiento Personal",
    price: 3999, // $39.99
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570",
    previewUrl: null,
    downloadUrl: "https://example.com/download/guia-desarrollo.pdf",
    duration: "120 páginas",
    isActive: true
  },
  {
    title: "El Poder de los Pequeños Hábitos",
    description: "Descubre cómo los pequeños cambios diarios pueden transformar tu vida a largo plazo.",
    type: "video",
    category: "Hábitos",
    price: 1299, // $12.99
    imageUrl: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    downloadUrl: "https://example.com/download/pequenos-habitos.mp4",
    duration: "12:38",
    isActive: true
  },
  {
    title: "Comunicación Efectiva y Liderazgo",
    description: "Desarrolla habilidades de comunicación que te convertirán en un líder inspirador y efectivo.",
    type: "audiobook",
    category: "Liderazgo",
    price: 2199, // $21.99
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    downloadUrl: "https://example.com/download/comunicacion-liderazgo.mp3",
    duration: "4:22",
    isActive: true
  },
  {
    title: "Guía de Inteligencia Emocional",
    description: "Aprende a gestionar tus emociones y mejorar tus relaciones interpersonales de manera efectiva.",
    type: "guide",
    category: "Inteligencia Emocional",
    price: 2799, // $27.99
    imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56",
    previewUrl: null,
    downloadUrl: "https://example.com/download/inteligencia-emocional.pdf",
    duration: "85 páginas",
    isActive: true
  },
  {
    title: "Script: El Poder de los Pequeños Hábitos",
    description: "Texto completo del video con todos los ejemplos y explicaciones sobre cómo implementar hábitos transformadores en tu vida.",
    type: "pdf",
    category: "Hábitos",
    price: 799, // $7.99
    imageUrl: "https://images.unsplash.com/photo-1528319725582-ddc096101511",
    previewUrl: null,
    downloadUrl: "https://example.com/download/script-habitos.pdf",
    duration: null,
    isActive: true
  }
];

async function seedProducts() {
  try {
    console.log("Seeding products...");
    
    // Clear existing products
    await db.delete(products);
    
    // Insert sample products
    await db.insert(products).values(sampleProducts);
    
    console.log("Products seeded successfully!");
  } catch (error) {
    console.error("Error seeding products:", error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedProducts();
}

export { seedProducts };