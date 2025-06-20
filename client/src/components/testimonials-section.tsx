import { useQuery } from '@tanstack/react-query';
import { Testimonial } from '@shared/schema';
import { Skeleton } from './ui/skeleton';
import { Star, StarHalf } from 'lucide-react';

function TestimonialsSection() {
  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
  });

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="text-accent h-4 w-4 fill-current" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="text-accent h-4 w-4 fill-current" />);
    }
    
    return stars;
  };

  return (
    <section id="testimonios" className="py-8 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 ml-[-3px] mr-[-3px]">
          <h2 className="md:text-4xl font-montserrat font-bold text-dark mb-4 text-[25px] ml-[-19px] mr-[-19px]">
            Lo Que Dicen Nuestros Clientes
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-8"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Conoce las experiencias de quienes han transformado sus vidas con nuestro contenido.
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-3 sm:p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-2 sm:mb-4">
                  <Skeleton className="w-8 h-8 sm:w-12 sm:h-12 rounded-full" />
                  <div className="ml-2 sm:ml-4">
                    <Skeleton className="h-3 sm:h-5 w-20 sm:w-32 mb-1" />
                    <Skeleton className="h-2 sm:h-4 w-16 sm:w-24" />
                  </div>
                </div>
                <Skeleton className="h-3 sm:h-4 w-full mb-1 sm:mb-2" />
                <Skeleton className="h-3 sm:h-4 w-full mb-1 sm:mb-2" />
                <Skeleton className="h-3 sm:h-4 w-4/5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {testimonials?.map((testimonial) => (
              <div key={testimonial.id} className="card-hover bg-white p-3 sm:p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-2 sm:mb-4">
                  <img 
                    src={testimonial.imageUrl} 
                    alt={testimonial.name} 
                    className="w-8 h-8 sm:w-12 sm:h-12 rounded-full object-cover"
                  />
                  <div className="ml-2 sm:ml-4">
                    <h4 className="font-montserrat font-bold text-xs sm:text-base">{testimonial.name}</h4>
                    <div className="flex text-accent">
                      {renderStars(testimonial.rating).map((star, i) => (
                        <span key={i} className="text-xs sm:text-base">{star}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 italic line-clamp-4 sm:line-clamp-none">"{testimonial.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default TestimonialsSection;
