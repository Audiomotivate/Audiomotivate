import { useQuery } from '@tanstack/react-query';
import { Product } from '@shared/schema';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import SimpleAudioPlayer from './ui/simple-audio-player';
import { ChevronRight, Clock, Star, Plus, ChevronLeft } from 'lucide-react';
import { Link } from 'wouter';

function VideosSection() {
  const { data: allProducts = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    staleTime: 0,
  });

  const videos = allProducts.filter(product => product.type === 'video');
  
  // Debug logging
  if (videos.length > 0) {
    console.log('Videos found:', videos.length, videos);
  }

  return (
    <section id="videos" className="py-8 bg-white">
      <div className="container mx-auto px-4 mt-[-37px] mb-[-37px]">
        <div className="text-center mb-12">
          <h2 className="md:text-4xl font-montserrat font-bold text-dark text-[25px] ml-[-16px] mr-[-16px] mt-[5px] mb-[5px] pt-[-3px] pb-[-3px]">Audios de Superación Personal</h2>
          <div className="w-20 h-1 bg-accent mx-auto mb-8"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Contenido inspirador para superar obstáculos, mantener tu motivación al máximo nivel y enfocarte en tus metas.
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-lg overflow-hidden shadow-md">
                <Skeleton className="w-full h-32 sm:h-48" />
                <div className="p-3 sm:p-6">
                  <Skeleton className="h-5 sm:h-8 w-20 sm:w-28 mb-2 sm:mb-3" />
                  <Skeleton className="h-4 sm:h-6 w-full mb-1 sm:mb-2" />
                  <Skeleton className="h-3 sm:h-4 w-full mb-2 sm:mb-4" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 sm:h-6 w-12 sm:w-20" />
                    <Skeleton className="h-3 sm:h-4 w-16 sm:w-24" />
                  </div>
                  <Skeleton className="h-8 sm:h-10 w-full mt-2 sm:mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative mb-12">
            {/* Botones de navegación */}
            <button 
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-300"
              onClick={() => {
                const container = document.getElementById('videos-carousel');
                if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <button 
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-300"
              onClick={() => {
                const container = document.getElementById('videos-carousel');
                if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Carrusel horizontal */}
            <div 
              id="videos-carousel"
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-8"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {videos?.map((video) => (
                <Link href={`/product/${video.id}`} key={video.id} className="flex-shrink-0">
                  <div className="group cursor-pointer w-36 md:w-48 transition-all duration-300 hover:scale-105">
                    {/* Imagen del producto */}
                    <div className="relative mb-3">
                      <img 
                        src={video.imageUrl} 
                        alt={video.title} 
                        className="w-full h-48 md:h-64 rounded-lg object-contain bg-gray-50 shadow-lg"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                      {video.badge && (
                        <Badge className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 font-bold shadow-lg">
                          {video.badge}
                        </Badge>
                      )}

                    </div>

                    {/* Contenido debajo de la imagen */}
                    <div className="px-1">
                      <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 text-sm group-hover:text-accent transition-colors leading-tight">
                        {video.title}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-400 mb-2 line-clamp-1">
                        De: {video.category}
                      </p>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i}
                            className={`h-3 w-3 md:h-4 md:w-4 ${i < 4 ? 'text-yellow-500 fill-current' : 'text-gray-400'}`}
                          />
                        ))}
                        <span className="text-xs text-gray-400 ml-1">4.7</span>
                      </div>

                      {/* Duración */}
                      {video.duration && (
                        <div className="flex items-center text-gray-500 text-xs md:text-sm">
                          <Clock className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                          {video.duration}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-center">
          <Link href="/audios">
            <Button 
              variant="link" 
              className="text-gray-800 font-bold text-lg hover:underline flex items-center justify-center mx-auto whitespace-normal max-w-none hover:text-accent transition-colors"
            >
              Ver todos los Audios
              <ChevronRight className="ml-1 h-4 w-4 flex-shrink-0" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default VideosSection;
