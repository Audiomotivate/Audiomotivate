import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { CartItemWithProduct } from '@shared/schema';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { formatCurrency } from '../lib/utils';
import { ShoppingBag, CreditCard, User, Mail, Shield, CheckCircle, Star } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import TestimonialsCarousel from '../components/testimonials-carousel';
import Header from '../components/header';
import { queryClient } from '../lib/queryClient';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface CartResponse {
  cart: {
    id: number;
    sessionId: string;
  };
  items: CartItemWithProduct[];
}

function CheckoutForm({ total, cartItems, testimonials }: { total: number; cartItems: CartItemWithProduct[]; testimonials?: any[] }) {
  const stripe = useStripe();
  const elements = useElements();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
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

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: total,
          customer: customerInfo
        }),
      });

      const { clientSecret } = await response.json();

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            email: customerInfo.email,
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
          },
        }
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment was successful and we can handle it here
        setMessage('¡Pago exitoso! Preparando tu contenido...');
        setIsCompleting(true);
        
        const customerName = encodeURIComponent(`${customerInfo.firstName} ${customerInfo.lastName}`);
        
        // Show completion process step by step
        setTimeout(() => {
          setMessage('Verificando tu compra...');
        }, 500);
        
        setTimeout(() => {
          setMessage('Preparando acceso a tu contenido...');
        }, 1000);
        
        setTimeout(() => {
          setMessage('Finalizando... ¡Ya casi está listo!');
        }, 1500);
        
        // Navigate immediately after payment confirmation
        setTimeout(() => {
          setLocation(`/order-success?name=${customerName}`);
        }, 1800);
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        // Payment needs additional authentication
        setMessage('Se requiere autenticación adicional...');
        setIsProcessing(false);
      } else {
        // Payment failed or is processing
        setMessage('Procesando pago...');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Error en checkout:', err);
      setMessage(`Error: ${err instanceof Error ? err.message : 'Ocurrió un error inesperado. Por favor intenta nuevamente.'}`);
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <Card>
        <CardHeader className="pt-[23px] pb-[23px] mt-[-6px] mb-[-6px] ml-[0px] mr-[0px] flex flex-col space-y-1.5 p-6">
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
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 font-medium flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Recibirás instantáneamente en este correo el enlace de descarga para acceder a tu contenido digital adquirido
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <span>Información de Pago</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="h-4 w-4 inline mr-1" />
              Información de la tarjeta
            </label>
            <div className="space-y-3">
              <div className="p-4 border border-gray-300 rounded-lg bg-white shadow-sm">
                <CardElement 
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#374151',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        lineHeight: '24px',
                        '::placeholder': {
                          color: '#9CA3AF',
                        },
                      },
                      invalid: {
                        color: '#EF4444',
                      },
                    },
                    hidePostalCode: true,
                  }}
                />
              </div>
              
              <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <CreditCard className="h-3 w-3 mr-1" />
                  <span className="font-medium">Campos incluidos:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Número de tarjeta (16 dígitos)</li>
                  <li>Fecha de expiración (MM/AA)</li>
                  <li>Código de seguridad (CVC)</li>
                </ul>
              </div>
              
              <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-700 flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  Tu información está protegida con encriptación de nivel bancario
                </p>
              </div>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-lg text-sm font-medium ${
              message.includes('exitoso') 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message.includes('exitoso') && <CheckCircle className="h-4 w-4 inline mr-2" />}
              {message}
            </div>
          )}

          {/* Order Total */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total a pagar</p>
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(total)}</p>
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={!stripe || isProcessing || isCompleting || !customerInfo.email}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
            size="lg"
          >
            {(isProcessing || isCompleting) ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isCompleting ? 'Preparando tu contenido...' : 'Procesando Pago...'}
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Shield className="h-5 w-5 mr-2" />
                Completar Compra Segura
              </div>
            )}
          </Button>

          {message && (
            <div className={`p-4 rounded-lg text-center ${
              message.includes('Error') 
                ? 'bg-red-50 text-red-800 border border-red-200' 
                : message.includes('exitoso') || isCompleting
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              <div className="flex items-center justify-center space-x-2">
                {(message.includes('exitoso') || isCompleting) && (
                  <CheckCircle className="h-5 w-5 text-green-600 animate-pulse" />
                )}
                <p className="text-sm font-medium">{message}</p>
              </div>
            </div>
          )}

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center text-xs text-gray-500">
              <Shield className="h-3 w-3 mr-1" />
              <span>Pago 100% seguro procesado por Stripe</span>
            </div>
            <div className="flex items-center justify-center text-xs text-gray-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              <span>Entrega instantánea por email</span>
            </div>
          </div>
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

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const cartItems = cartData?.items || [];
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const total = subtotal;

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
        {/* Header */}
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
          {/* Left Column - Order Summary */}
          <div className="space-y-6">
            <Card className="shadow-xl border-0">
              <CardHeader className="ml-[0px] mr-[0px] flex flex-col space-y-1.5 p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg mt-[-7px] mb-[-7px] pt-[9px] pb-[9px]">
                <CardTitle className="flex items-center space-x-2 text-[21px]">
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
                        {item.product.type === 'audiobook' ? 'Audiolibro' : 
                         item.product.type === 'video' ? 'Video' : 
                         item.product.type === 'guide' ? 'Guía' : 'PDF'}
                      </p>
                      <p className="text-xs font-medium text-blue-600">
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-base text-gray-900">
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
                
                <Separator className="my-4" />
                
                <div className="space-y-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex justify-between text-gray-700 text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">{formatCurrency(subtotal)}</span>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    * Precios en pesos mexicanos (MXN)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Testimonials Carousel */}
            {testimonials && <TestimonialsCarousel testimonials={testimonials} />}

          </div>



          {/* Right Column - Checkout Form */}
          <div>
            <Elements stripe={stripePromise}>
              <CheckoutForm total={total} cartItems={cartItems} testimonials={testimonials} />
            </Elements>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}