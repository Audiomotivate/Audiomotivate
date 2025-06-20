import { Button } from './ui/button';
import { Input } from "./ui/input";
import { Search } from "lucide-react";

interface HeroSectionProps {
  onSearch?: (term: string) => void;
  searchTerm?: string;
}

function HeroSection({ onSearch, searchTerm = "" }: HeroSectionProps) {
  return (
    <section 
      id="inicio" 
      className="relative h-[25vh] md:h-[40vh] -mt-4 flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')" }}
    >
      <div className="absolute inset-0 overlay-gradient"></div>
      <div className="container mx-auto px-4 z-10 text-white text-center">
        <h1 className="text-3xl md:text-5xl font-montserrat font-bold mb-6 text-shadow">
          <div>Transforma Tu Vida</div>
          <div>con Audio Motívate</div>
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto text-shadow">
          Audiolibros y contenido motivacional para elevar tu mente y alcanzar tu máximo potencial.
        </p>
      </div>
    </section>
  );
}

export default HeroSection;
