import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'wouter';

export function CartButtonNav() {
  return (
    <Link href="/checkout">
      <Button 
        variant="default"
        className="ml-4 bg-primary hover:bg-primary/90 text-white"
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        Ver Carrito
      </Button>
    </Link>
  );
}