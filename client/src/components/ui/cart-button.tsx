import { useState } from 'react';
import { Button } from './button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../hooks/use-cart';

interface CartButtonProps {
  className?: string;
}

export function CartButton({ className }: CartButtonProps) {
  const { cartItemsCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleClick = () => {
    console.log('CartButton: handleClick ejecutado');
    // Emitir un evento personalizado para abrir el carrito
    const event = new CustomEvent('open-cart-drawer');
    window.dispatchEvent(event);
  };
  
  return (
    <Button 
      variant="default" 
      className={className || "bg-primary hover:bg-primary/90 text-white"} 
      onClick={handleClick}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      Carrito ({cartItemsCount})
    </Button>
  );
}