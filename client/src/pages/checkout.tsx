import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { CartItemWithProduct } from '@shared/schema';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { formatCurrency } from '../lib/utils';
import { ShoppingBag, CreditCard, User, Mail, Shield, CheckCircle, Star, Download, Clock, Smartphone } from 'lucide-react';
import { Link } from 'wouter';
import TestimonialsCarousel from '../components/testimonials-carousel';
import Header from '../components/header';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface CartResponse {
  cart: {
    id: number;
    sessionId: string;
  };
  items: CartItemWithProduct[];
}

function CheckoutForm({ total }: { total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email) {
      setMessage('Por favor completa todos los campos requeridos');
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success?name=${encodeURIComponent(`${customerInfo.firstName} ${customerInfo.lastName}`)}`,
        payment_method_data: {
          billing_details: {
            email: customerInfo.email,
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
          },
        }
      }
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <span>Información Personal</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input 
                type="text" 
                required
                value={customerInfo.firstName}
                onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido *
              </label>
              <input 
                type="text" 
                required
                value={customerInfo.lastName}
                onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Tu apellido"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="h-4 w-4 inline mr-1" />
              Email *
            </label>
            <input 
              type="email" 
              required
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="tu@email.com"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <span>Información de Pago</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-gray-300 rounded-lg bg-white">
            <PaymentElement />
          </div>
          
          {message && (
            <div className={`p-4 rounded-lg text-sm font-medium ${
              message.includes('exitoso') 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total a pagar</p>
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(total)}</p>
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={!stripe || isProcessing || !customerInfo.email}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold rounded-lg transition-all duration-200"
            size="lg"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Procesando Pago...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Shield className="h-5 w-5 mr-2" />
                Completar Compra Segura
              </div>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

export default function Checkout() {
  const { data: cartData } = useQuery<CartResponse>({
    queryKey: ['/api/cart'],
  });

  const { data: testimonials } = useQuery({
    queryKey: ['/api/testimonials'],
  });

  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const cartItems = cartData?.items || [];
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const total = subtotal;

  useEffect(() => {
    if (total > 0) {
      console.log('Creating payment intent for total:', total);
      fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: total,
          currency: 'mxn'
        }),
      })
      .then(response => {
        console.log('Checkout response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Payment intent created:', data);
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          console.error('No clientSecret in response:', data);
        }
      })
      .catch(error => {
        console.error('Error creating payment intent:', error);
      });
    }
  }, [total]);

  if (cartItems.length === 0) {
    return (
      <>
        <Header showMobileFixedSearch={false} />
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-24 pb-12">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <ShoppingBag className="h-20 w-20 mx-auto text-gray-400 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h1>
            <p className="text-gray-600 mb-8 text-lg">
              Añade algunos productos antes de proceder al checkout.
            </p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                Continuar Comprando
              </Button>
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header showMobileFixedSearch={false} />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center mb-3">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                La Inversión en tí es sin duda, la Mejor Inversión.
              </h1>
              <Star className="h-5 w-5 text-yellow-500 ml-2" />
            </div>
            <p className="text-base text-gray-700 max-w-2xl mx-auto">
              Completa tu compra y recibe instantáneamente el contenido que te ayudará a alcanzar tus metas
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingBag className="h-5 w-5" />
                    <span>Resumen del Pedido</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.title}
                        className="w-16 h-20 object-contain bg-gray-50 rounded-lg shadow-md"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm">{item.product.title}</h3>
                        <p className="text-xs text-gray-600 capitalize mb-1">
                          {item.product.type}
                        </p>
                        <p className="text-xs text-gray-500">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{formatCurrency(item.product.price)}</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between text-lg font-bold text-blue-600">
                      <span>Total:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                    <p className="text-xs text-gray-500">* Precios en pesos mexicanos (MXN)</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm total={total} />
                </Elements>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Preparando el pago...</p>
                </div>
              )}
              
              {/* What You Get Section */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <Download className="h-5 w-5" />
                    <span>Lo que obtienes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Download className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Acceso instantáneo</h4>
                        <p className="text-sm text-gray-600">Descarga inmediata después del pago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Smartphone className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Compatible con todos los dispositivos</h4>
                        <p className="text-sm text-gray-600">Escucha en móvil, tablet o computadora</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Clock className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Acceso de por vida</h4>
                        <p className="text-sm text-gray-600">Sin límites de tiempo ni restricciones</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-yellow-100 rounded-full">
                        <Star className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Contenido premium</h4>
                        <p className="text-sm text-gray-600">Material exclusivo de alta calidad</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-center text-gray-700">
                      <CheckCircle className="h-4 w-4 inline text-green-600 mr-1" />
                      <strong>Garantía de satisfacción:</strong> Si no estás completamente satisfecho, te devolvemos tu dinero.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonials Section */}
              {testimonials && testimonials.length > 0 && (
                <Card className="shadow-lg border-0">
                  <CardContent className="p-6">
                    <TestimonialsCarousel testimonials={testimonials} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
