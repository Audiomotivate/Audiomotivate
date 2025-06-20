import { useCart } from '../hooks/use-cart';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { ShoppingBag, Minus, Plus, X, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { Link } from 'wouter';
import Header from '../components/header';

function Cart() {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity,
    subtotal,
    cartItemsCount
  } = useCart();

  return (
    <>
      <Header showMobileFixedSearch={false} />
      <div className="container mx-auto px-4 py-12 max-w-6xl pt-24">
      <h1 className="text-3xl font-bold font-montserrat mb-8">Tu Carrito</h1>
      
      {cartItemsCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg mb-2">Tu carrito está vacío</h3>
          <p className="text-muted-foreground text-center">
            Parece que no has agregado productos a tu carrito todavía.
          </p>
          <Link href="/">
            <Button className="mt-6 bg-primary hover:bg-primary/90">
              Continuar comprando
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="font-semibold text-xl mb-4">Productos</h2>
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-start border-b border-gray-200 dark:border-gray-800 pb-6 last:border-0 last:pb-0">
                    <div className="h-24 w-24 rounded overflow-hidden mr-4 flex-shrink-0">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{item.product.title}</h4>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted-foreground hover:text-foreground ml-2"
                          aria-label="Eliminar del carrito"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.product.type === 'audiobook' ? 'Audiolibro' : 
                         item.product.type === 'video' ? 'Video' : 'PDF'}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-medium">
                          {formatCurrency(item.product.price)}
                        </span>
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-3 text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4">
              <Link href="/" className="inline-flex items-center text-primary hover:text-primary/90">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continuar comprando
              </Link>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 sticky top-24">
              <h2 className="font-semibold text-xl mb-4">Resumen</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Impuestos</span>
                  <span>Calculados al finalizar</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Envío</span>
                  <span>Gratis</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <Link href="/checkout">
                  <Button className="w-full bg-primary hover:bg-primary/90 mt-4">
                    Proceder al Pago
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default Cart;