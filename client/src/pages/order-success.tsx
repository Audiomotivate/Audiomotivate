import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle, Mail, Download, Home, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import Header from '../components/header';

export default function OrderSuccess() {
  const [location] = useLocation();
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Clear cart after successful purchase
    fetch('/api/cart', { method: 'DELETE' }).catch(console.error);
    
    // Extract customer info from URL
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const name = urlParams.get('name') || 'Estimado Cliente';
    const email = urlParams.get('email') || '';
    
    setCustomerName(name);
    setCustomerEmail(email);
  }, [location]);

  return (
    <>
      <Header showMobileFixedSearch={false} />
      <main className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¡Muchas gracias por tu compra {customerName}!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tu inversión en desarrollo personal ha sido procesada exitosamente
            </p>
          </div>

          {/* Email Confirmation Card */}
          <Card className="shadow-lg border-0 mb-8">
            <CardContent className="p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-green-100 rounded-full">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Email de Descarga Enviado
                  </h3>
                  <p className="text-gray-600">Los enlaces han sido enviados a tu correo</p>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-green-800 font-medium mb-2">
                      ✅ Email enviado exitosamente a:
                    </p>
                    <p className="text-green-700 font-mono bg-white px-4 py-2 rounded border text-lg">
                      📧 {customerEmail}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-white rounded border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-2">El email incluye:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Enlaces directos de descarga de Google Drive</li>
                    <li>• Mensaje de agradecimiento por tu compra</li>
                    <li>• Instrucciones para acceder a tu contenido</li>
                    <li>• Válido por 30 días</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center space-x-2 text-yellow-600">
                <Shield className="h-4 w-4" />
                <p className="text-sm">
                  Si no encuentras el email, revisa tu carpeta de spam
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Motivational Quote */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                "La Inversión En Ti Mismo Es Sin duda, La Mejor Inversión."
              </h2>
              <p className="text-blue-100 text-lg">
                Has dado el primer paso hacia tu transformación personal. ¡Felicidades!
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              size="lg"
            >
              <Home className="h-5 w-5 mr-2" />
              Volver al Inicio
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/contacto'}
              variant="outline"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
              size="lg"
            >
              <Mail className="h-5 w-5 mr-2" />
              Contacto y Soporte
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
