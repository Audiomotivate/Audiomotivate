import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { CheckCircle, Download, Mail, Home, Star } from 'lucide-react';
import Header from '../components/header';
import { queryClient } from '../lib/queryClient';

export default function OrderSuccess() {
  const [customerName, setCustomerName] = useState('');
  const [, setLocation] = useLocation();

  // Immediate setup when component mounts
  useEffect(() => {
    // Get customer name from URL parameters immediately
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    if (name) {
      setCustomerName(decodeURIComponent(name));
    }
    
    // Clear cart immediately when reaching success page
    const clearCartAndRefresh = async () => {
      try {
        await fetch('/api/cart/clear', { method: 'DELETE' });
        queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      } catch (e) {
        console.log('Cart already cleared');
      }
    };
    
    clearCartAndRefresh();
    
    // Smooth scroll to top for better experience
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }, []);

  return (
    <>
      <Header showMobileFixedSearch={false} />
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-16 pb-12">
        <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          
          <div className="flex items-center justify-center mb-3">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              ¡Muchas gracias por tu compra {customerName}!
            </h1>
            <Star className="h-5 w-5 text-yellow-500 ml-2" />
          </div>
          
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Tu inversión en desarrollo personal ha sido procesada exitosamente
          </p>
        </div>

        {/* Success Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Mail className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Acceso Inmediato</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Hemos enviado los enlaces de descarga a tu correo electrónico. 
                Revisa tu bandeja de entrada y también la carpeta de spam.
              </p>

            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6 pt-[1px] pb-[1px]">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Próximos Pasos</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">1</span>
                  Revisa tu email para los enlaces de descarga
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">2</span>
                  Descarga tu contenido digital
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">3</span>
                  ¡Comienza tu transformación personal!
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">4</span>
                  Los enlaces estarán disponibles por 30 días
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Motivational Message */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-8 shadow-xl border-0">
          <CardContent className="p-8 text-center">

            <p className="text-lg font-medium pt-[-14px] pb-[-14px] ml-[-25px] mr-[-25px] pl-[-10px] pr-[-10px] mt-[-13px] mb-[-13px]">"La Inversión En Ti Mismo Es Sin duda, La Mejor Inversión."</p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center">
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
            size="lg"
            onClick={() => {
              setLocation('/');
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 100);
            }}
          >
            <Home className="h-5 w-5 mr-2" />
            Volver al Inicio
          </Button>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            ¿No recibiste el email? Revisa tu carpeta de spam o 
            <button 
              className="text-blue-600 hover:text-blue-800 underline ml-1"
              onClick={() => window.open('mailto:soporte@audiomotivate.com', '_blank')}
            >
              contáctanos para ayudarte
            </button>
          </p>
        </div>
      </div>
    </main>
    </>
  );
}