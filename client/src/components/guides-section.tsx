import { useQuery } from '@tanstack/react-query';
import { Product } from '@shared/schema';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { FileText, ChevronLeft, ChevronRight, Star, Clock } from 'lucide-react';
import { Link } from 'wouter';

function GuidesSection() {
  const { data: allProducts = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    staleTime: 0,
  });

  console.log('Guides Section - Products:', allProducts, 'Loading:', isLoading, 'Error:', error);

  const guides = allProducts.filter(product => product.type === 'guide');

  return (
    <section id="guias" className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="md:text-4xl font-montserrat font-bold text-dark mb-4 text-[25px]">Guías de Crecimiento Personal</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-8"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Guías prácticas y estrategias probadas para alcanzar tus objetivos personales y profesionales.
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md">
                <Skeleton className="w-full h-32 sm:h-48" />
                <div className="p-3 sm:p-6">
                  <Skeleton className="h-5 sm:h-8 w-20 sm:w-28 mb-2 sm:mb-3" />
                  <Skeleton className="h-4 sm:h-6 w-full mb-1 sm:mb-2" />
                  <Skeleton className="h-3 sm:h-4 w-full mb-2 sm:mb-4" />
                </div>
              </div>
            ))}
          </div>
        ) : guides.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-6">Próximamente nuevas guías</p>
          </div>
        ) : (
          <div className="relative mb-12">
            {/* Botones de navegación */}
            <button 
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-300"
              onClick={() => {
                const container = document.getElementById('guides-carousel');
                if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <button 
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-300"
              onClick={() => {
                const container = document.getElementById('guides-carousel');
                if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Carrusel horizontal */}
            <div 
              id="guides-carousel"
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-8"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {guides?.map((guide, index) => (
                <Link href={`/product/${guide.id}`} key={guide.id} className="flex-shrink-0">
                  <div className="group cursor-pointer w-36 md:w-48 transition-all duration-300 hover:scale-105">
                    {/* Imagen del producto */}
                    <div className="relative mb-3">
                      <img 
                        src={guide.imageUrl} 
                        alt={guide.title} 
                        className="w-full h-48 md:h-64 rounded-lg object-contain bg-gray-50 shadow-lg"
                      />
                      {guide.badge && (
                        <Badge className="absolute top-2 left-2 bg-primary text-white">
                          {guide.badge}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Información del producto */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm md:text-base text-gray-800 line-clamp-2 leading-tight">
                        {guide.title}
                      </h3>
                      
                      <div className="flex items-center text-xs md:text-sm text-gray-600">
                        <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        <span>{guide.duration}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg md:text-xl text-primary">
                          ${(guide.price / 100).toFixed(2)} MXN
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <button className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
            <Link href="/guides" className="flex items-center">
              Ver todas las Guías
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </button>
        </div>
      </div>
    </section>
  );
}

export default GuidesSection;
