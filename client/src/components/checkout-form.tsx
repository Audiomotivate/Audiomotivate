import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useLocation } from 'wouter';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, Shield, Mail, User } from 'lucide-react';
import { useCart } from '../providers/cart-provider';

interface CheckoutFormProps {
  clientSecret: string;
  total: number;
  processing: boolean;
  setProcessing: (processing: boolean) => void;
}

export default function CheckoutForm({ clientSecret, total, processing, setProcessing }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [, setLocation] = useLocation();
  const { clearCart } = useCart();
  const [message, setMessage] = useState('');
  const [step, setStep] = useState('');
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

    setProcessing(true);
    setMessage('');

    try {
      // Step-by-step feedback
      setStep('Verificando compra...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setStep('Preparando acceso...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setStep('Finalizando...');

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success`,
          payment_method_data: {
            billing_details: {
              name: `${customerInfo.firstName} ${customerInfo.lastName}`,
              email: customerInfo.email,
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        setMessage(error.message || 'Error en el pago');
        setProcessing(false);
        setStep('');
      } else {
        // Payment successful
        setStep('¡Completado!');
        setMessage('¡Pago exitoso! Preparando tu contenido...');
        
        // Clear cart and redirect
        await clearCart();
        
        setTimeout(() => {
          const customerName = encodeURIComponent(`${customerInfo.firstName} ${customerInfo.lastName}`);
          setLocation(`/order-success?name=${customerName}&email=${encodeURIComponent(customerInfo.email)}`);
        }, 1000);
      }
    } catch (err) {
      console.error('Error en checkout:', err);
      setMessage('Error inesperado. Por favor intenta nuevamente.');
      setProcessing(false);
      setStep('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Información Personal
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tu apellido"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
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
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 font-medium flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Recibirás instantáneamente el enlace de descarga en este correo
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Pago</CardTitle>
          <p className="text-sm text-gray-600">
            Solo necesitas tu tarjeta. Sin cuentas adicionales requeridas.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Información de la tarjeta
            </label>
            <div className="p-4 border border-gray-300 rounded-lg bg-white">
              <PaymentElement 
                options={{
                  layout: 'tabs',
                  paymentMethodOrder: ['card'],
                  fields: {
                    billingDetails: 'never'
                  },
                  terms: {
                    card: 'never'
                  },
                  wallets: {
                    applePay: 'never',
                    googlePay: 'never'
                  }
                }}
              />
            </div>
          </div>

          {(message || step) && (
            <div className={`p-4 rounded-lg text-sm font-medium ${
              message.includes('exitoso') || step === '¡Completado!'
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : message.includes('Error')
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              {step && (
                <div className="flex items-center">
                  {step === '¡Completado!' ? (
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  ) : (
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                  )}
                  {step}
                </div>
              )}
              {message && <div className="mt-1">{message}</div>}
            </div>
          )}

          {/* Order Total */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total a pagar</p>
              <p className="text-3xl font-bold text-blue-600">${total.toFixed(2)} MXN</p>
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={!stripe || processing || !customerInfo.email}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold rounded-lg"
            size="lg"
          >
            {processing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {step || 'Procesando Pago...'}
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Shield className="w-5 h-5 mr-2" />
                Completar Compra Segura
              </div>
            )}
          </Button>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center text-xs text-gray-500">
              <Shield className="w-3 h-3 mr-1" />
              <span>Pago 100% seguro procesado por Stripe</span>
            </div>
            <div className="flex items-center justify-center text-xs text-gray-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              <span>Entrega instantánea por email</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
