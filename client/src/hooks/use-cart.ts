import { useContext } from 'react';
import { CartContext } from '../providers/cart-provider';

export function useCart() {
  const context = useContext(CartContext);
  
  if (!context) {
    console.error('Error: useCart hook was called outside of CartProvider context');
    throw new Error('useCart must be used within a CartProvider');
  }
  
  console.log('Cart context loaded successfully:', {
    isCartOpen: context.isCartOpen,
    cartItemsCount: context.cartItemsCount,
    hasOpenCartFunction: !!context.openCart
  });
  
  return context;
}
