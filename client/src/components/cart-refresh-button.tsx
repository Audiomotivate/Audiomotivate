import { useState } from 'react';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/use-toast';

export function CartRefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const refreshCart = async () => {
    try {
      setIsRefreshing(true);
      
      // Refrescar datos del carrito
      await queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      // Forzar una nueva solicitud de datos
      const response = await fetch('/api/cart');
      const cartData = await response.json();
      
      console.log('Carrito actualizado:', cartData);
      
      // Notificar al usuario
      toast({
        title: 'Carrito actualizado',
        description: 'Los productos del carrito se han actualizado correctamente.'
      });
      
      // Emitir evento para refrescar la visualización del carrito
      const event = new CustomEvent('refresh-cart');
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error('Error al refrescar el carrito:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el carrito.',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <Button 
      variant="outline"
      size="sm"
      className="ml-2" 
      onClick={refreshCart}
      disabled={isRefreshing}
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      <span className="sr-only">Refrescar carrito</span>
    </Button>
  );
}