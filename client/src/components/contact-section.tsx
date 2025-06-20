import { Button } from './ui/button';
import { Youtube, Facebook, Instagram, Mail } from 'lucide-react';

function ContactSection() {

  return (
    <section id="contacto" className="py-16 bg-white">
      <div className="container mx-auto px-4 mt-[-47px] mb-[-47px]">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-montserrat font-bold text-dark mb-4 text-center text-[25px]">Contáctanos</h2>
            <div className="w-20 h-1 bg-primary mb-8 mx-auto"></div>
            <p className="text-lg text-gray-700 mb-6 text-center">
              ¿Tienes alguna pregunta o sugerencia? ¡Nos encantaría saber de ti!
            </p>
            
            <div className="space-y-4 mb-8">

              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <Mail className="text-primary h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Contacto por Email</h4>
                  <a href="mailto:info.audiomotivate@gmail.com" className="text-gray-600 hover:text-primary">info.audiomotivate@gmail.com</a>
                </div>
              </div>

            </div>
            
            <div className="flex justify-center space-x-4">
              <a href="https://www.facebook.com/profile.php?id=61558673675004" target="_blank" rel="noopener noreferrer">
                <Button variant="default" size="icon" className="bg-primary hover:bg-primary/90 text-white w-10 h-10 rounded-full p-0">
                  <Facebook className="h-5 w-5" />
                </Button>
              </a>
              <a href="https://www.instagram.com/audiomotivate" target="_blank" rel="noopener noreferrer">
                <Button variant="default" size="icon" className="bg-primary hover:bg-primary/90 text-white w-10 h-10 rounded-full p-0">
                  <Instagram className="h-5 w-5" />
                </Button>
              </a>
              <a href="https://www.youtube.com/@AudioMotivate." target="_blank" rel="noopener noreferrer">
                <Button variant="default" size="icon" className="bg-primary hover:bg-primary/90 text-white w-10 h-10 rounded-full p-0">
                  <Youtube className="h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
