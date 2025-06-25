import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, CreditCard, Shield, Clock, CheckCircle, Star } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../components/checkout-form';
import { useCart } from '../providers/cart-provider';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { cartItems, clearCart } = useCart();
  const cart = cartItems.map(item => ({
    id: item.product.id,
    title: item.product.title,
    price: item.product.price,
    quantity: item.quantity,
    imageUrl: item.product.imageUrl,
    badge: item.product.badge,
    duration: item.product.duration
  }));
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Fetch testimonials
  const { data: testimonials = [] } = useQuery({
    queryKey: ['/api/testimonials'],
    enabled: true
  });

  useEffect(() => {
    if (cart.length === 0) {
      setLocation('/');
      return;
    }

    const createPaymentIntent = async () => {
      try {
        const response = await apiRequest('POST', '/api/checkout', {
          cartItems: cart.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          total
        });
        
        if (response.client_secret) {
          setClientSecret(response.client_secret);
        }
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast({
          title: "Error",
          description: "Error al preparar el pago. Inténtalo de nuevo.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [cart, total, setLocation, toast]);

  if (cart.length === 0) {
    return null;
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Resumen del Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-20 h-28 object-contain rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
                      {item.badge && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                      <div className="flex flex-col gap-1 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Cantidad: {item.quantity}</span>
                          <span className="font-semibold">${item.price.toFixed(2)} MXN</span>
                        </div>
                        {item.duration && (
                          <span className="text-xs text-gray-500">Duración: {item.duration}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">${total.toFixed(2)} MXN</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Por qué elegir Audio Motívate?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Sin anuncios ni interrupciones (vs YouTube)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Descarga inmediata en alta calidad</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Acceso de por vida a tu contenido</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Soporte en español las 24h</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonials */}
            {testimonials.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lo que dicen nuestros usuarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {testimonials.slice(0, 2).map((testimonial, index) => (
                      <div key={index} className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 italic">"{testimonial.content}"</p>
                        <p className="text-xs text-gray-600 mt-2 font-medium">- {testimonial.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span>Pago seguro procesado por Stripe</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span>Links de descarga enviados por email inmediatamente</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información de Pago</CardTitle>
                <p className="text-sm text-gray-600">
                  Solo necesitas tu tarjeta. Sin cuentas adicionales requeridas.
                </p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="ml-3">Preparando pago seguro...</span>
                  </div>
                ) : clientSecret ? (
                  <Elements options={options} stripe={stripePromise}>
                    <CheckoutForm 
                      clientSecret={clientSecret}
                      total={total}
                      processing={processing}
                      setProcessing={setProcessing}
                    />
                  </Elements>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-red-600">Error al cargar el formulario de pago</p>
                    <Button
                      onClick={() => window.location.reload()}
                      className="mt-4"
                    >
                      Reintentar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
