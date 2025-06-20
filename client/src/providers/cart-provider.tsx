import { createContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { CartItemWithProduct, Product } from '@shared/schema';

interface CartContextType {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  cartItems: CartItemWithProduct[];
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartItemsCount: number;
  subtotal: number;
}

export const CartContext = createContext<CartContextType>({
  isCartOpen: false,
  openCart: () => {},
  closeCart: () => {},
  cartItems: [],
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  cartItemsCount: 0,
  subtotal: 0,
});

interface CartProviderProps {
  children: ReactNode;
}

interface CartResponse {
  cart: {
    id: number;
    sessionId: string;
  };
  items: CartItemWithProduct[];
}

export function CartProvider({ children }: CartProviderProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: cartData } = useQuery<CartResponse>({
    queryKey: ['/api/cart'],
  });

  useEffect(() => {
    const checkInitialClear = async () => {
      const shouldClearOnLoad = sessionStorage.getItem('clear-cart-on-load');
      if (shouldClearOnLoad) {
        try {
          const response = await fetch('/api/cart/clear', {
            method: 'DELETE',
            credentials: 'include'
          });
          
          if (response.ok) {
            await queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
          }
        } catch (error) {
          console.error('Error clearing cart:', error);
        }
        
        sessionStorage.removeItem('clear-cart-on-load');
      }
    };
    
    checkInitialClear();
  }, []);
  
  const cartItems = cartData?.items || [];
  
  const cartItemsCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  
  const subtotal = cartItems.reduce(
    (total, item) => total + (item.product.price * item.quantity), 
    0
  );
  
  const openCart = () => {
    setIsCartOpen(true);
  };
  
  const closeCart = () => {
    setIsCartOpen(false);
  };
  
  const addToCart = async (product: Product) => {
    try {
      sessionStorage.removeItem('clear-cart-on-load');
      
      const cartResponse = await fetch('/api/cart');
      const cartData = await cartResponse.json();
      
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
        throw new Error('Error al añadir producto al carrito');
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      const event = new CustomEvent('open-cart-drawer');
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };
  
  const removeFromCart = async (cartItemId: number) => {
    try {
      await apiRequest('DELETE', `/api/cart/items/${cartItemId}`);
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };
  
  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      await apiRequest('PATCH', `/api/cart/items/${cartItemId}`, { quantity });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    } catch (error) {
      console.error('Error updating item quantity:', error);
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch('/api/cart/clear', {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      await queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      await queryClient.refetchQueries({ queryKey: ['/api/cart'] });
      
      localStorage.removeItem('cart-data');
      sessionStorage.removeItem('cart-data');
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };
  
  return (
    <CartContext.Provider 
      value={{
        isCartOpen,
        openCart,
        closeCart,
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartItemsCount,
        subtotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}