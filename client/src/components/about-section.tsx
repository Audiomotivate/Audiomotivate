import { Headphones, Volume2, FileText, BookOpen, ClipboardList } from 'lucide-react';
import { Link } from 'wouter';

function AboutSection() {
  return (
    <section id="categorias" className="pt-4 pb-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-xl md:text-3xl font-montserrat font-bold text-dark mb-3">
            Explora Nuestro Contenido
          </h2>
          <div className="w-16 h-1 bg-accent mx-auto mb-4"></div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <Link href="/audiolibros">
              <div className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 p-4 lg:p-8 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer min-h-[160px] lg:min-h-[200px]">
                <div className="bg-blue-600 w-12 h-12 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Headphones className="text-white" size={20} />
                </div>
                <h3 className="text-sm lg:text-xl font-montserrat font-bold mb-2 lg:mb-3 text-blue-800">Audiolibros</h3>
                <p className="text-sm lg:text-lg text-blue-700 leading-relaxed">
                  Audiolibros poderosos para transformar tu vida
                </p>
              </div>
            </Link>
            
            <Link href="/audios">
              <div className="group bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 p-4 lg:p-8 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer min-h-[160px] lg:min-h-[200px]">
                <div className="bg-purple-600 w-12 h-12 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Volume2 className="text-white" size={20} />
                </div>
                <h3 className="text-sm lg:text-xl font-montserrat font-bold mb-2 lg:mb-3 text-purple-800">Audios de Superación</h3>
                <p className="text-sm lg:text-lg text-purple-700 leading-relaxed">
                  Contenido inspirador para enfocarte en tus objetivos
                </p>
              </div>
            </Link>
            
            <Link href="/pdfs">
              <div className="group bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 p-4 lg:p-8 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer min-h-[160px] lg:min-h-[200px]">
                <div className="bg-green-600 w-12 h-12 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-5 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="text-white" size={20} />
                </div>
                <h3 className="text-sm lg:text-xl font-montserrat font-bold mb-2 lg:mb-3 text-green-800">Ebooks y Scripts</h3>
                <p className="text-sm lg:text-lg text-green-700 leading-relaxed">
                  Descarga nuestros ebooks para estudiar a tu ritmo
                </p>
              </div>
            </Link>
            
            <Link href="/guias">
              <div className="group bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 p-4 lg:p-8 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer min-h-[160px] lg:min-h-[200px]">
                <div className="bg-orange-600 w-12 h-12 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-5 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="text-white" size={20} />
                </div>
                <h3 className="text-sm lg:text-xl font-montserrat font-bold mb-2 lg:mb-3 text-orange-800">Guías en PDF</h3>
                <p className="text-sm lg:text-lg text-orange-700 leading-relaxed">
                  Ejercicios prácticos para aplicar lo aprendido
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
