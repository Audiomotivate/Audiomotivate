import { useState } from 'react';
import { Button } from './ui/button';
import { Product } from '@shared/schema';
import { useToast } from '../hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface AddToCartButtonProps {
  product: Product;
  variant?: 'primary' | 'accent';
  className?: string;
}

function AddToCartButton({ product, variant = 'primary', className = '' }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAddToCart = async () => {
    try {
      setIsLoading(true);
      console.log('Añadiendo producto al carrito desde botón dedicado:', product.title);
      
      // Generate session ID and store in localStorage for consistency
      let sessionId = localStorage.getItem('cart-session-id');
      if (!sessionId) {
        sessionId = 'browser-session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('cart-session-id', sessionId);
      }
      
      // Añadimos el producto al carrito
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error al añadir producto:', errorData);
        toast({
          title: 'Error',
          description: 'No se pudo añadir el producto al carrito.',
          variant: 'destructive'
        });
        return;
      }
      
      const responseData = await response.json();
      console.log('Producto añadido correctamente:', responseData);
      
      // Force refresh cart data with a small delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
        queryClient.refetchQueries({ queryKey: ['/api/cart'] });
      }, 100);
      
      // Mostramos mensaje de éxito
      toast({
        title: '¡Producto añadido!',
        description: `${product.title} se ha añadido a tu carrito.`
      });
      
      // Abrimos el drawer del carrito con delay to ensure data is updated
      setTimeout(() => {
        const event = new CustomEvent('open-cart-drawer');
        window.dispatchEvent(event);
      }, 300);
      
    } catch (error) {
      console.error('Error al añadir producto al carrito:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al añadir el producto al carrito.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const colorClass = variant === 'primary' 
    ? 'bg-primary hover:bg-primary/90' 
    : 'bg-accent hover:bg-accent/90';
  
  return (
    <Button 
      className={`w-full ${colorClass} ${className}`}
      onClick={handleAddToCart}
      disabled={isLoading}
    >
      {isLoading ? 'Añadiendo...' : 'Añadir al Carrito'}
    </Button>
  );
}

export default AddToCartButton;
