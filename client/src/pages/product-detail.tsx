import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Star, Clock, Download, Play, User, ChevronLeft, ShoppingCart, Headphones } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import AddToCartButton from '../components/add-to-cart-button';
import SimpleAudioPlayer from '../components/ui/simple-audio-player';
import TestimonialsCarousel from '../components/testimonials-carousel';
import { Link } from 'wouter';
import Header from '../components/header';

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
}

export default function ProductDetail() {
  const [, params] = useRoute('/product/:id');
  const productId = params?.id;

  // Mock testimonials for demonstration
  const mockTestimonials = [
    {
      id: 1,
      name: "Ana Martínez",
      rating: 5,
      comment: "Transformó mi forma de pensar. Es increíble cómo algo tan simple puede tener tanto impacto.",
      imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b890?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Carlos Ruiz",
      rating: 4,
      comment: "Muy buena calidad de audio y contenido muy inspirador. Vale la pena cada euro invertido.",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Ana Martínez",
      rating: 5,
      comment: "Transformó mi forma de pensar. Es increíble cómo algo tan simple puede tener tanto impacto.",
      imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/${productId}`],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error('Producto no encontrado');
      return response.json();
    },
    enabled: !!productId,
  });

  const { data: relatedProducts } = useQuery({
    queryKey: [`/api/products/type/${product?.type}`],
    queryFn: async () => {
      const response = await fetch(`/api/products/type/${product?.type}`);
      if (!response.ok) throw new Error('Error al cargar productos relacionados');
      return response.json();
    },
    enabled: !!product?.type,
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-16 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-16 pb-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </main>
    );
  }

  const rating = 4.8; // Rating fijo por ahora
  const reviewCount = 247;
  const fullDescription = product.description;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'audiobook': return 'Audiolibro';
      case 'video': return 'Video';
      case 'pdf': return 'PDF/Script';
      case 'guide': return 'Guía';
      default: return type;
    }
  };

  const filteredRelatedProducts = relatedProducts?.filter((p: Product) => p.id !== product.id).slice(0, 3) || [];

  return (
    <>
      <Header showMobileFixedSearch={false} />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-32 pb-12">
      <div className="max-w-6xl mx-auto px-4 ml-[0px] mr-[0px] mt-[-65px] mb-[-65px]">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-blue-600 hover:text-blue-800">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
          </Link>
        </div>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Left Column - Image */}
          <div className="space-y-6 mt-[-23px] mb-[-23px]">
            <Card className="overflow-hidden shadow-xl border-0">
              <div className="aspect-square">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-contain bg-gray-50"
                />
              </div>
            </Card>
            
            {product.previewUrl ? (
              <Card className="p-6 bg-white border-gray-200 shadow-md mt-[12px] mb-[12px] ml-[-3px] mr-[-3px] pl-[25px] pr-[25px] pt-[4px] pb-[4px]">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-600 rounded-full p-3 flex-shrink-0 hover:bg-blue-700 transition-colors cursor-pointer">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-600 mb-3 text-[13px]">Escucha una muestra.</p>
                    <SimpleAudioPlayer src={product.previewUrl} className="w-full" />
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Headphones className="h-3 w-3 mr-1" />
                      <span>Recomendamos usar auriculares</span>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm mt-[12px] mb-[12px] ml-[-3px] mr-[-3px]">
                <div className="flex items-center space-x-3 text-center">
                  <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                    <Play className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-blue-800 text-sm font-medium">Preview disponible pronto</p>
                    <p className="text-blue-600 text-xs">Mientras tanto, revisa la descripción completa</p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6 lg:pt-0">
            <div className="mt-[-12px] mb-[-12px]">
              <Badge variant="outline" className="bg-blue-100 text-blue-800 mb-3">
                {getTypeLabel(product.type)} • {product.category}
              </Badge>
              
              <h1 className="font-bold text-gray-900 mb-4 text-[20px]">{product.title}</h1>
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(rating) 
                          ? 'text-yellow-500 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {rating} ({reviewCount} reseñas)
                </span>
              </div>

              {/* Duration */}
              {product.duration && (
                <div className="flex items-center mb-4 text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Duración: {product.duration}</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-3xl font-bold text-blue-600">
                    {formatCurrency(product.price)}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">MXN (Pesos mexicanos)</p>
                </div>
                <div className="flex items-center text-sm text-green-600">
                  <Download className="h-4 w-4 mr-1" />
                  Acceso inmediato
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-green-900 mb-2">✓ Lo que obtienes al comprarlo:</h4>
                <ul className="text-sm text-green-800 space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-3 flex-shrink-0"></span>
                    <span><strong>Audio completo SIN ANUNCIOS</strong> - Disfruta sin interrupciones (disponible en YouTube con anuncios)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-3 flex-shrink-0"></span>
                    <span><strong>Escúchalo las veces que quieras</strong> - Acceso de por vida</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-3 flex-shrink-0"></span>
                    <span><strong>Descarga directa a tu dispositivo</strong> - Llévalo contigo offline</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-3 flex-shrink-0"></span>
                    <span><strong>Acceso inmediato</strong> - Disponible después del pago</span>
                  </li>
                </ul>
              </div>

              {/* Testimonials */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Lo que dicen nuestros clientes</h3>
                <TestimonialsCarousel testimonials={mockTestimonials} />
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <Card className="mb-16 shadow-lg border-0">
          <CardContent className="p-8 ml-[-6px] mr-[-6px] pt-[6px] pb-[6px] pl-[13px] pr-[13px]">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Descripción completa</h2>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line text-base max-w-none">
              {fullDescription}
            </div>
          </CardContent>
        </Card>

        {/* Related Products */}
        {filteredRelatedProducts.length > 0 && (
          <div className="mt-[8px] mb-[49px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">También te puede interesar</h2>
            </div>
            
            <div className="overflow-x-auto">
              <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
                {filteredRelatedProducts.map((relatedProduct: Product) => (
                  <Link key={relatedProduct.id} href={`/product/${relatedProduct.id}`}>
                    <div className="flex-shrink-0 w-36 group cursor-pointer">
                      <div className="relative mb-3">
                        <div className="w-36 h-48 bg-gray-200 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-300">
                          <img
                            src={relatedProduct.imageUrl}
                            alt={relatedProduct.title}
                            className="w-full h-full object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                      <div className="px-1">
                        <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {relatedProduct.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-blue-600 font-bold text-sm">
                            {formatCurrency(relatedProduct.price)}
                          </span>
                          <div className="flex items-center text-xs text-gray-500">
                            <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                            4.8
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}



      </div>
      {/* Sticky Add to Cart Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
        <div className="max-w-md mx-auto">
          <AddToCartButton 
            product={product}
            className="w-full py-3 text-lg font-semibold"
          />
        </div>
      </div>
      </main>
    </>
  );
}