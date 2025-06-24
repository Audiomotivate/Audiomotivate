import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { CartItemWithProduct } from '@shared/schema';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { formatCurrency } from '../lib/utils';
import { ShoppingBag, CreditCard, User, Mail, Shield, Star } from 'lucide-react';
import { Link } from 'wouter';
import Header from '../components/header';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface CartResponse {
  cart: { id: number; sessionId: string; };
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

    if (!stripe || !elements) return;

    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email) {
      setMessage('Por favor completa todos los campos requeridos');
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success?name=${encodeURIComponent(`${customerInfo.firstName} ${customerInfo.lastName}`)}`
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
              <input 
                type="text" 
                required
                value={customerInfo.firstName}
                onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Apellido *</label>
              <input 
                type="text" 
                required
                value={customerInfo.lastName}
                onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="p-4 rounded-lg text-sm font-medium bg-red-100 text-red-800 border border-red-200">
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
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold rounded-lg"
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

  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const cartItems = cartData?.items || [];
  const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  useEffect(() => {
    if (total > 0) {
      setLoading(true);
      fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError('Error al preparar el pago');
        }
        setLoading(false);
      })
      .catch(error => {
        setError('Error de conexión');
        setLoading(false);
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
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-3">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                La Inversión en tí es sin duda, la Mejor Inversión
              </h1>
              <Star className="h-5 w-5 text-yellow-500 ml-2" />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingBag className="h-5 w-5" />
                    <span>Resumen del Pedido</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-3">
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.title}
                        className="w-16 h-20 object-contain rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{item.product.title}</h3>
                        <p className="text-xs text-gray-600">
                          {item.product.type === 'audiobook' ? 'Audiolibro' : 
                           item.product.type === 'audio' ? 'Audio' : 
                           item.product.type === 'guide' ? 'Guía' : 'Script'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="bg-blue-50 p-4 rounded-lg mt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-blue-600">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Preparando el pago...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm total={total} />
                </Elements>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
