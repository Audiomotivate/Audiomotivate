import { useState, useEffect, useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";
import Header from "../components/header";
import HeroSection from "../components/hero-section";
import AboutSection from "../components/about-section";
import AudiobooksSection from "../components/audiobooks-section";
import VideosSection from "../components/videos-section";
import GuidesSection from "../components/guides-section";
import PDFSection from "../components/pdf-section";
import TestimonialsSection from "../components/testimonials-section";
import ContactSection from "../components/contact-section";
import CallToAction from "../components/call-to-action";
import FeaturedQuote from "../components/featured-quote";
import CityNotificationPopup from "../components/city-notification-popup";
import Footer from "../components/footer";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Link } from "wouter";
import { formatCurrency } from "../lib/utils";
import { Star } from "lucide-react";

interface Product {
  id: number;
  title: string;
  description: string;
  type: string;
  category: string;
  price: number;
  imageUrl: string;
  previewUrl?: string;
  duration?: string;
  badge?: string;
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'audiobook': return 'Audiolibro';
    case 'video': return 'Video';
    case 'pdf': return 'PDF';
    case 'guide': return 'Guía';
    default: return type;
  }
};

export default function Home() {
  const [showCityPopup, setShowCityPopup] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all products and filter by type
  const { data: allProducts = [] } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    staleTime: 0, // Force refresh
  });

  // Filter products by type
  const audiobooks = allProducts.filter((p: Product) => p.type === 'audiobook');
  const videos = allProducts.filter((p: Product) => p.type === 'video');  
  const guides = allProducts.filter((p: Product) => p.type === 'guide');
  const pdfs = allProducts.filter((p: Product) => p.type === 'pdf');

  // Combine all products for search
  const combinedProducts = useMemo(() => {
    return [
      ...(audiobooks || []),
      ...(videos || []),
      ...(guides || []),
      ...(pdfs || [])
    ];
  }, [audiobooks, videos, guides, pdfs]);

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    return combinedProducts.filter((product: Product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [combinedProducts, searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  useEffect(() => {
    // Handle hash navigation when component mounts
    const hash = window.location.hash.substring(1);
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          const headerHeight = 80;
          const elementPosition = element.offsetTop - headerHeight;
          
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          });
        }
      }, 500);
    }
  }, []);

  // Show search results if there's a search term
  if (searchTerm.trim()) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header onSearch={handleSearch} searchTerm={searchTerm} showSearch={true} showMobileFixedSearch={true} />
        <main className="md:pt-24 pt-[32px] pb-[32px]" style={{ paddingTop: 'calc(6rem + env(safe-area-inset-top))' }}>
          <div className="md:hidden h-12"></div> {/* Space for mobile search bar */}
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl md:text-3xl font-montserrat font-bold">
                  Resultados para "{searchTerm}"
                </h1>
                <button
                  onClick={clearSearch}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Limpiar búsqueda
                </button>
              </div>
              
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {filteredProducts.map((product: Product) => (
                    <Link key={product.id} href={`/product/${product.id}`} className="flex-shrink-0">
                      <div className="group cursor-pointer w-full transition-all duration-300 hover:scale-105">
                        {/* Imagen del producto */}
                        <div className="relative mb-3">
                          <img 
                            src={product.imageUrl} 
                            alt={product.title} 
                            className="w-full h-48 md:h-64 rounded-lg object-contain bg-gray-50 shadow-lg"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                          {product.badge && (
                            <Badge className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 font-bold shadow-lg">
                              {product.badge}
                            </Badge>
                          )}
                        </div>

                        {/* Contenido debajo de la imagen */}
                        <div className="px-1">
                          <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 text-sm md:text-base group-hover:text-blue-600 transition-colors leading-tight">
                            {product.title}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-400 mb-2 line-clamp-1">
                            De: {product.category || 'Desarrollo Personal'}
                          </p>
                          
                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i}
                                className={`h-3 w-3 md:h-4 md:w-4 ${i < 4 ? 'text-yellow-500 fill-current' : 'text-gray-400'}`}
                              />
                            ))}
                            <span className="text-xs md:text-sm text-gray-400 ml-1">4.8</span>
                          </div>

                          {/* Precio y duración */}
                          <div className="flex items-center justify-between">
                            <span className="text-pink-600 font-bold text-sm md:text-base">
                              {formatCurrency(product.price)}
                            </span>
                            {product.duration && (
                              <div className="flex items-center text-gray-500 text-xs md:text-sm">
                                ⏱ {product.duration}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">
                    No se encontraron productos para "{searchTerm}"
                  </p>
                  <button
                    onClick={clearSearch}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Ver todos los productos
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onSearch={handleSearch} searchTerm={searchTerm} showSearch={true} showMobileFixedSearch={true} />
      
      <main className="pt-20 md:pt-20 pb-4" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top))' }}>
        <div className="md:hidden h-12"></div> {/* Space for mobile search bar */}
        <HeroSection />
        <AboutSection />
        <AudiobooksSection />
        <VideosSection />
        <PDFSection />
        <GuidesSection />
        <TestimonialsSection />
        <CallToAction />
        <ContactSection />
        
        {showCityPopup && (
          <CityNotificationPopup onClose={() => setShowCityPopup(false)} />
        )}
      </main>
      <Footer />
    </div>
  );
}
