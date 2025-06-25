import { useEffect, useState } from 'react';
import { useCart } from '../providers/cart-provider';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Star, Shield, Download, Clock } from 'lucide-react';
import { useLocation } from 'wouter';
import CheckoutForm from '../components/checkout-form';

interface Testimonial {
  id: number;
  name: string;
  rating: number;
  comment: string;
  location?: string;
}

export default function Checkout() {
  const { state } = useCart();
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch testimonials
  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
    enabled: true
  });

  // Create payment intent
  useEffect(() => {
    if (state.items.length === 0) {
      setLocation('/');
      return;
    }

    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: state.total,
            items: state.items
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [state.items, state.total, setLocation]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  if (state.items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la tienda
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Checkout Form */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Finalizar compra</h1>
              <p className="text-gray-600">Completa tu información para acceder a tu contenido</p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <CheckoutForm clientSecret={clientSecret} />
            )}
          </div>

          {/* Right Column - Order Summary & Benefits */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen del pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.title}
                      className="w-16 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.product.title}</h3>
                      <p className="text-gray-600 text-sm">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatPrice(state.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What You Get */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  Lo que obtienes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <Download className="w-4 h-4 mr-3 text-blue-600" />
                  <span>Acceso inmediato por email</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-3 text-purple-600" />
                  <span>Enlaces de descarga por 7 días</span>
                </div>
                <div className="flex items-center text-sm">
                  <Shield className="w-4 h-4 mr-3 text-green-600" />
                  <span>Contenido sin anuncios (vs YouTube)</span>
                </div>
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 mr-3 text-yellow-600" />
                  <span>Calidad premium garantizada</span>
                </div>
              </CardContent>
            </Card>

            {/* Testimonials */}
            {testimonials.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    Lo que dicen nuestros clientes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {testimonials.slice(0, 3).map((testimonial) => (
                    <div key={testimonial.id} className="border-l-2 border-yellow-500 pl-4">
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-500 mr-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{testimonial.name}</span>
                        {testimonial.location && (
                          <span className="text-xs text-gray-500 ml-2">{testimonial.location}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{testimonial.comment}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
