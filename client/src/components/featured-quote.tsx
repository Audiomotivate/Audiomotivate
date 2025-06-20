import { Quote } from 'lucide-react';

function FeaturedQuote() {
  return (
    <section className="py-8 bg-primary text-white text-center">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Quote className="h-6 w-6 mx-auto mb-3 opacity-50" />
          <blockquote className="text-lg md:text-xl font-montserrat italic mb-4">
            "La inversión en uno mismo es la mejor inversión que puedes hacer."
          </blockquote>
          <cite className="block text-md">— Jim Rohn</cite>
        </div>
      </div>
    </section>
  );
}

export default FeaturedQuote;
