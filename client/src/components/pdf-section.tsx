import { useQuery } from '@tanstack/react-query';
import { Product } from '@shared/schema';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { formatCurrency } from '../lib/utils';
import { ChevronLeft, ChevronRight, Star, Clock } from 'lucide-react';
import AddToCartButton from './add-to-cart-button';
import { Link } from 'wouter';

function PDFSection() {
  const { data: allProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    staleTime: 0,
  });

  const pdfs = allProducts.filter(product => product.type === 'pdf');

  return (
    <section id="scripts" className="py-8 bg-gray-50">
      <div className="container mx-auto px-4 pt-[0px] pb-[0px] mt-[29px] mb-[29px]">
        <div className="text-center mb-12">
          <h2 className="md:text-4xl font-montserrat font-bold text-dark mb-4 text-[25px]">Ebook y Scripts de Videos</h2>
          <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Adquiere nuestros ebooks y los scripts completos de los videos en formato PDF o Word para profundizar en el contenido y estudiarlo a tu propio ritmo.
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md flex flex-col">
                <Skeleton className="w-full h-32 sm:h-48" />
                <div className="p-3 sm:p-6 flex-1">
                  <Skeleton className="h-5 sm:h-8 w-20 sm:w-28 mb-2 sm:mb-3" />
                  <Skeleton className="h-4 sm:h-6 w-full mb-1 sm:mb-2" />
                  <Skeleton className="h-3 sm:h-4 w-full mb-2 sm:mb-4" />
                  <div className="flex items-center justify-between mt-auto">
                    <Skeleton className="h-4 sm:h-6 w-12 sm:w-20" />
                    <Skeleton className="h-5 sm:h-10 w-24 sm:w-36" />
                  </div>
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
                const container = document.getElementById('pdfs-carousel');
                if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <button 
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-300"
              onClick={() => {
                const container = document.getElementById('pdfs-carousel');
                if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Carrusel horizontal */}
            <div 
              id="pdfs-carousel"
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-8"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {pdfs?.map((pdf) => (
                <Link href={`/product/${pdf.id}`} key={pdf.id} className="flex-shrink-0">
                  <div className="group cursor-pointer w-36 md:w-48 transition-all duration-300 hover:scale-105">
                    {/* Imagen del producto */}
                    <div className="relative mb-3">
                      <img 
                        src={pdf.imageUrl} 
                        alt={pdf.title} 
                        className="w-full h-48 md:h-64 rounded-lg object-contain bg-gray-50 shadow-lg"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                      {pdf.badge && (
                        <Badge className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 font-bold shadow-lg">
                          {pdf.badge}
                        </Badge>
                      )}
                    </div>

                    {/* Contenido debajo de la imagen */}
                    <div className="px-1">
                      <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 text-sm md:text-base group-hover:text-primary transition-colors leading-tight">
                        {pdf.title}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-400 mb-2 line-clamp-1">
                        De: {pdf.category}
                      </p>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i}
                            className={`h-3 w-3 md:h-4 md:w-4 ${i < 4 ? 'text-yellow-500 fill-current' : 'text-gray-400'}`}
                          />
                        ))}
                        <span className="text-xs text-gray-400 ml-1">4.5</span>
                      </div>

                      {/* Duración si existe */}
                      {pdf.duration && (
                        <div className="flex items-center text-gray-500 text-xs md:text-sm">
                          <Clock className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                          {pdf.duration}
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
          <Link href="/scripts">
            <Button 
              variant="link" 
              className="text-gray-800 font-bold text-lg hover:underline flex items-center justify-center mx-auto whitespace-normal max-w-none hover:text-primary transition-colors"
            >
              Ver todos los ebooks y scripts
              <ChevronRight className="ml-1 h-4 w-4 flex-shrink-0" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default PDFSection;
