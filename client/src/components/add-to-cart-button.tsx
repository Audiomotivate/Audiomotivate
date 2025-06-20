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
      
      // Primero obtenemos la información del carrito
      const cartResponse = await fetch('/api/cart');
      const cartData = await cartResponse.json();
      console.log('Información del carrito obtenida:', cartData);
      
      // Ahora añadimos el producto al carrito
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      
      // Actualizamos los datos del carrito
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      // Mostramos mensaje de éxito
      toast({
        title: '¡Producto añadido!',
        description: `${product.title} se ha añadido a tu carrito.`
      });
      
      // Abrimos el drawer del carrito
      const event = new CustomEvent('open-cart-drawer');
      window.dispatchEvent(event);
      
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

export { AddToCartButton };
export default AddToCartButton;