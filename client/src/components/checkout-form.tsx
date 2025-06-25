import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { useCart } from '../providers/cart-provider';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useLocation } from 'wouter';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  clientSecret: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { clearCart } = useCart();
  const [, setLocation] = useLocation();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'finalizing'>('form');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!customerInfo.name || !customerInfo.email) {
      toast({
        title: "Información requerida",
        description: "Por favor completa tu nombre y email",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setStep('processing');

    try {
      // Step 1: Verificando compra
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 2: Processing payment
      setStep('finalizing');
      
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          receipt_email: customerInfo.email,
        },
        redirect: 'if_required'
      });

      if (error) {
        toast({
          title: "Error en el pago",
          description: error.message,
          variant: "destructive"
        });
        setIsProcessing(false);
        setStep('form');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Clear cart immediately for smooth transition
        clearCart();
        
        // Brief delay for smooth UX
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Navigate to success page
        setLocation('/order-success');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Error en el pago",
        description: "Hubo un problema procesando tu pago. Por favor intenta de nuevo.",
        variant: "destructive"
      });
      setIsProcessing(false);
      setStep('form');
    }
  };

  const getStepText = () => {
    switch (step) {
      case 'processing':
        return 'Verificando compra...';
      case 'finalizing':
        return 'Preparando acceso...';
      default:
        return '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información de contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              placeholder="Tu nombre completo"
              required
              disabled={isProcessing}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              placeholder="tu@email.com"
              required
              disabled={isProcessing}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de pago</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentElement 
            options={{
              layout: 'accordion',
              defaultValues: {
                billingDetails: {
                  name: customerInfo.name,
                  email: customerInfo.email
                }
              },
              terms: {
                card: 'never'
              }
            }}
          />
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            <span>{getStepText()}</span>
          </div>
        ) : (
          'Completar compra'
        )}
      </Button>
    </form>
  );
};

const CheckoutFormWrapper: React.FC<CheckoutFormProps> = ({ clientSecret }) => {
  if (!clientSecret) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Elements 
      stripe={stripePromise} 
      options={{ 
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#EAB308',
          }
        }
      }}
    >
      <CheckoutForm clientSecret={clientSecret} />
    </Elements>
  );
};

export default CheckoutFormWrapper;
