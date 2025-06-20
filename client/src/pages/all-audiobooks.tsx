import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Input } from "../components/ui/input";
import AddToCartButton from "../components/add-to-cart-button";
import SimpleAudioPlayer from "../components/ui/simple-audio-player";
import { formatCurrency } from "../lib/utils";
import { Clock, ChevronLeft, ChevronRight, Star, Search, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import Header from "../components/header";

export default function AllAudiobooks() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const { data: audiobooks, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products/type/audiobook'],
  });

  // Filter products based on search term
  const filteredAudiobooks = audiobooks?.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <>
        <Header showMobileFixedSearch={false} />
        <main className="min-h-screen bg-gray-50 pt-24 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-montserrat font-bold text-center mb-6">Todos los Audiolibros</h1>
            <div className="flex justify-center mb-6">
              <Link href="/">
                <Button variant="outline" className="bg-white hover:bg-gray-50">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al inicio
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md">
                <Skeleton className="w-full h-32 sm:h-48" />
                <div className="p-3 sm:p-6">
                  <Skeleton className="h-5 sm:h-8 w-20 sm:w-28 mb-2 sm:mb-3" />
                  <Skeleton className="h-4 sm:h-6 w-full mb-1 sm:mb-2" />
                  <Skeleton className="h-3 sm:h-4 w-full mb-2 sm:mb-4" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 sm:h-6 w-12 sm:w-20" />
                    <Skeleton className="h-5 sm:h-8 w-24 sm:w-36" />
                  </div>
                  <Skeleton className="h-8 sm:h-10 w-full mt-2 sm:mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      </>
    );
  }

  return (
    <>
      <Header showMobileFixedSearch={false} />
      <main className="min-h-screen bg-gray-50 pt-24 py-8">
        <div className="container mx-auto px-4 ml-[-4px] mr-[-4px] mt-[-29px] mb-[-29px]">
        <div className="mb-8">
          {/* Mobile Header - Stack vertically */}
          <div className="md:hidden space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <Link href="/">
                <Button variant="outline" className="bg-white hover:bg-gray-50 flex-shrink-0">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>
              </Link>
              
              <div className="relative flex-1 ml-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>
            <h1 className="text-xl font-montserrat font-bold text-center">Todos los Audiolibros</h1>
          </div>

          {/* Desktop Header - Single row */}
          <div className="hidden md:flex items-center justify-between mb-6 gap-4">
            <Link href="/">
              <Button variant="outline" className="bg-white hover:bg-gray-50 flex-shrink-0">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Volver al inicio
              </Button>
            </Link>
            
            <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-center flex-1 px-4">Todos los Audiolibros</h1>
            
            <div className="relative w-56 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar audiolibros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-300 focus:border-primary focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="w-20 h-1 bg-primary mx-auto mb-8"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto text-center">
            Explora nuestra colección completa de audiolibros motivacionales y de desarrollo personal.
          </p>
        </div>
        
        {/* Más vendidos */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-montserrat font-bold mb-8 text-gray-800">Más vendidos</h2>
          <div className="relative">
            <button 
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-300"
              onClick={() => {
                const container = document.getElementById('bestsellers-audiobooks-carousel');
                if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <button 
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-300"
              onClick={() => {
                const container = document.getElementById('bestsellers-audiobooks-carousel');
                if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div 
              id="bestsellers-audiobooks-carousel"
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-8"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {(searchTerm ? filteredAudiobooks : audiobooks?.filter(p => p.isBestseller))?.slice(0, 6).map((product) => (
                <Link href={`/product/${product.id}`} key={product.id} className="flex-shrink-0">
                  <div className="group cursor-pointer w-36 md:w-48 transition-all duration-300 hover:scale-105">
                    <div className="relative mb-3">
                      <img 
                        src={product.imageUrl} 
                        alt={product.title} 
                        className="w-full h-48 md:h-64 rounded-lg object-contain bg-gray-50 shadow-lg"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                      {product.badge && (
                        <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 font-bold shadow-lg">
                          {product.badge}
                        </Badge>
                      )}
                    </div>

                    <div className="px-1">
                      <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 text-sm md:text-base group-hover:text-primary transition-colors leading-tight">
                        {product.title}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-400 mb-2 line-clamp-1">
                        De: {product.category}
                      </p>
                      
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i}
                            className={`h-3 w-3 md:h-4 md:w-4 ${i < 4 ? 'text-yellow-500 fill-current' : 'text-gray-400'}`}
                          />
                        ))}
                        <span className="text-xs md:text-sm text-gray-400 ml-1">4.7</span>
                      </div>

                      {product.duration && (
                        <div className="flex items-center text-gray-500 text-xs md:text-sm">
                          <Clock className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                          {product.duration}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Nuevos lanzamientos */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-montserrat font-bold mb-8 text-gray-800">Nuevos lanzamientos</h2>
          <div className="relative">
            <button 
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-300"
              onClick={() => {
                const container = document.getElementById('new-releases-audiobooks-carousel');
                if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <button 
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-300"
              onClick={() => {
                const container = document.getElementById('new-releases-audiobooks-carousel');
                if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div 
              id="new-releases-audiobooks-carousel"
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-8"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {(searchTerm ? filteredAudiobooks : audiobooks?.filter(p => p.isNew))?.slice(0, 6).map((product) => (
                <Link href={`/product/${product.id}`} key={product.id} className="flex-shrink-0">
                  <div className="group cursor-pointer w-36 md:w-48 transition-all duration-300 hover:scale-105">
                    <div className="relative mb-3">
                      <img 
                        src={product.imageUrl} 
                        alt={product.title} 
                        className="w-full h-48 md:h-64 rounded-lg object-contain bg-gray-50 shadow-lg"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                      {product.badge && (
                        <Badge className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 font-bold shadow-lg">
                          {product.badge}
                        </Badge>
                      )}
                    </div>

                    <div className="px-1">
                      <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 text-sm md:text-base group-hover:text-primary transition-colors leading-tight">
                        {product.title}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-400 mb-2 line-clamp-1">
                        De: {product.category}
                      </p>
                      
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i}
                            className={`h-3 w-3 md:h-4 md:w-4 ${i < 4 ? 'text-yellow-500 fill-current' : 'text-gray-400'}`}
                          />
                        ))}
                        <span className="text-xs md:text-sm text-gray-400 ml-1">4.9</span>
                      </div>

                      {product.duration && (
                        <div className="flex items-center text-gray-500 text-xs md:text-sm">
                          <Clock className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                          {product.duration}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}