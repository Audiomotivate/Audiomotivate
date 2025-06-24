import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { formatCurrency } from '../lib/utils';
import { useToast } from '../hooks/use-toast';
import { useLocation } from 'wouter';

interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    title: string;
    price: number;
    imageUrl: string;
    type: string;
  };
}

interface CartResponse {
  cart: {
    id: number;
    sessionId: string;
  };
  items: CartItem[];
}

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: cartData } = useQuery<CartResponse>({
    queryKey: ['/api/cart'],
  });

  // Escuchar el evento para abrir el drawer
  useEffect(() => {
    const handleOpenCartDrawer = () => setIsOpen(true);
    window.addEventListener('open-cart-drawer', handleOpenCartDrawer);
    return () => window.removeEventListener('open-cart-drawer', handleOpenCartDrawer);
  }, []);

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      let sessionId = localStorage.getItem('cart-session-id');
      if (!sessionId) {
        sessionId = 'browser-session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('cart-session-id', sessionId);
      }
      
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-session-id': sessionId
        },
        body: JSON.stringify({ productId, quantity }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update quantity');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la cantidad.',
        variant: 'destructive'
      });
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: async (productId: number) => {
      let sessionId = localStorage.getItem('cart-session-id');
      if (!sessionId) {
        sessionId = 'browser-session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('cart-session-id', sessionId);
      }
      
      const response = await fetch(`/api/cart?productId=${productId}`, {
        method: 'DELETE',
        headers: {
          'x-session-id': sessionId
        },
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to remove item');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: 'Producto eliminado',
        description: 'El producto se ha eliminado del carrito.'
      });
    }
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/cart/clear', {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to clear cart');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      setIsOpen(false);
      toast({
        title: 'Carrito vaciado',
        description: 'Todos los productos han sido eliminados del carrito.'
      });
    }
  });

  const items = cartData?.items || [];
  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Tu Carrito</h2>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {items.length}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Tu carrito está vacío</p>
              <p className="text-sm text-gray-400 mt-2">¡Añade algunos productos para comenzar!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 bg-gray-50 p-4 rounded-lg">
                  <img 
                    src={item.product.imageUrl} 
                    alt={item.product.title}
                    className="w-20 h-28 object-cover rounded-lg shadow-md flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 leading-tight mb-2 line-clamp-2">{item.product.title}</h3>
                    <p className="text-lg font-bold text-blue-600 mb-3">{formatCurrency(item.product.price)}</p>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateQuantityMutation.mutate({ 
                          productId: item.product.id, 
                          quantity: Math.max(1, item.quantity - 1)
                        })}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateQuantityMutation.mutate({ 
                          productId: item.product.id, 
                          quantity: item.quantity + 1
                        })}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => removeItemMutation.mutate(item.product.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span className="text-blue-600">{formatCurrency(total)}</span>
            </div>
            
            <div className="space-y-2">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => {
                  setIsOpen(false);
                  setLocation('/checkout');
                }}
              >
                Proceder al Pago
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setIsOpen(false);
                  setLocation('/');
                }}
              >
                Seguir Comprando
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
