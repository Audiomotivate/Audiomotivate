import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { CheckCircle, Mail, Download, Home, ArrowRight, Star, Gift } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

function SimpleHeader() {
  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="text-2xl font-bold">
              <span className="text-yellow-500">Audio</span>
              <span className="text-blue-600">Motívate</span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function OrderSuccess() {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name') || '';
    const email = urlParams.get('email') || '';
    
    setCustomerName(name);
    setCustomerEmail(email);
  }, []);

  return (
    <>
      <SimpleHeader />
      <main className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-20 animate-pulse"></div>
              </div>
              <CheckCircle className="h-24 w-24 text-green-500 mx-auto relative z-10 animate-bounce" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-6 mb-4">
              ¡Compra Exitosa! 🎉
            </h1>
            
            {customerName && (
              <p className="text-xl text-gray-700 mb-2">
                ¡Gracias <span className="font-semibold text-blue-600">{customerName}</span>!
              </p>
            )}
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tu pago se ha procesado correctamente y tu transformación personal comienza ahora.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-6 w-6" />
                  <span>Email de Confirmación</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    ¡Email Enviado!
                  </h3>
                  
                  {customerEmail && (
                    <div className="bg-white p-4 rounded-lg border-2 border-green-200 mb-4">
                      <p className="text-sm text-gray-600 mb-1">Email enviado a:</p>
                      <p className="font-semibold text-green-600 break-words">
                        {customerEmail}
                      </p>
                    </div>
                  )}
                  
                  <p className="text-gray-600 text-sm mb-4">
                    Hemos enviado los enlaces de descarga a tu email. 
                    Revisa tu bandeja de entrada y carpeta de spam.
                  </p>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-yellow-800 text-xs font-medium">
                      ⏰ Los enlaces estarán disponibles por 30 días
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-6 w-6" />
                  <span>Próximos Pasos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Revisa tu email</h4>
                      <p className="text-gray-600 text-sm">
                        Los enlaces de descarga ya están en tu bandeja de entrada
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Descarga tu contenido</h4>
                      <p className="text-gray-600 text-sm">
                        Guarda los archivos en tu dispositivo para acceso offline
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">¡Comienza tu transformación!</h4>
                      <p className="text-gray-600 text-sm">
                        Dedica tiempo diario a consumir el contenido que adquiriste
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-xl border-0 bg-gradient-to-r from-purple-50 to-pink-50 mb-8">
            <CardContent className="p-8">
              <div className="text-center">
                <Gift className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  🌟 Tu Inversión en Desarrollo Personal
                </h2>
                <p className="text-gray-700 max-w-3xl mx-auto mb-6 leading-relaxed">
                  Has dado el primer paso hacia una mejor versión de ti mismo. El contenido que acabas de adquirir 
                  ha sido diseñado para ayudarte a alcanzar tus metas, mejorar tu mentalidad y transformar tu vida.
                </p>
                
                <div className="flex items-center justify-center space-x-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-gray-600 font-medium">Miles de personas ya transformaron sus vidas</span>
                </div>
                
                <div className="bg-white rounded-lg p-6 border border-purple-200">
                  <p className="text-purple-800 font-semibold text-lg mb-2">
                    💡 Consejo para maximizar tu inversión:
                  </p>
                  <p className="text-gray-700">
                    Dedica al menos 15-30 minutos diarios a escuchar o leer el contenido. 
                    La constancia es clave para ver resultados reales en tu vida.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <Link href="/">
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg"
                size="lg"
              >
                <Home className="h-5 w-5 mr-2" />
                Volver al Inicio
              </Button>
            </Link>
            
            <p className="text-gray-500 text-sm">
              ¿Necesitas ayuda? Contáctanos respondiendo al email de confirmación
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
