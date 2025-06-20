import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from './ui/button';

interface Testimonial {
  id: number;
  name: string;
  rating: number;
  comment: string;
  imageUrl?: string;
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
  className?: string;
}

export default function TestimonialsCarousel({ testimonials, className = '' }: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-advance carousel every 4 seconds
  useEffect(() => {
    if (!testimonials || testimonials.length <= 1) return;
    
    const interval = setInterval(() => {
      nextTestimonial();
    }, 4000);

    return () => clearInterval(interval);
  }, [testimonials?.length]);

  if (!testimonials || !testimonials.length) return null;

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="bg-gray-50 rounded-lg p-6 pt-[17px] pb-[17px] ml-[-11px] mr-[-11px] mt-[-29px] mb-[-29px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Reseñas de usuarios</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={prevTestimonial}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextTestimonial}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {currentTestimonial.imageUrl && (
            <img 
              src={currentTestimonial.imageUrl} 
              alt={currentTestimonial.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div>
            <h4 className="font-medium">{currentTestimonial.name}</h4>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i}
                  className={`h-4 w-4 ${i < currentTestimonial.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
        <p className="text-gray-600 italic">"{currentTestimonial.comment}"</p>
      </div>
      <div className="flex justify-center mt-4 gap-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-primary' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}