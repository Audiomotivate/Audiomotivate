import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface Product {
  id: number;
  title: string;
  price: number;
  imageUrl: string;
  type: string;
  downloadUrl?: string;
  previewUrl?: string;
}

interface CartItem {
  id: number;
  quantity: number;
  product: Product;
}

interface CartResponse {
  cart: { id: number; sessionId: string; };
  items: CartItem[];
}

const formatCurrency = (amount: number) => `$${amount.toFixed(2)} MXN`;

function CheckoutForm({ total, cartItems }: { total: number; cartItems: CartItem[] }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [processingStep, setProcessingStep] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email) {
      setMessage('Por favor completa todos los campos requeridos');
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
      setProcessingStep('Procesando pago...');
      
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success?name=${encodeURIComponent(`${customerInfo.firstName} ${customerInfo.lastName}`)}&email=${encodeURIComponent(customerInfo.email)}`,
          payment_method_data: {
            billing_details: {
              email: customerInfo.email,
              name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            },
          }
        }
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
        setIsProcessing(false);
        setProcessingStep('');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setProcessingStep('¡Pago exitoso! Enviando email...');
        
        try {
          const emailResponse = await fetch('/api/send-download-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerEmail: customerInfo.email,
              customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
              products: cartItems.map(item => ({
                title: item.product.title,
                downloadUrl: item.product.downloadUrl || item.product.previewUrl
              })),
              paymentIntentId: paymentIntent.id
            })
          });

          if (emailResponse.ok) {
            setProcessingStep('¡Email enviado! Redirigiendo...');
            setMessage(`✅ Email de descarga enviado a ${customerInfo.email}`);
            
            setTimeout(async () => {
              try {
                await fetch('/api/cart', { method: 'DELETE' });
              } catch (cartError) {
                console.warn('Error clearing cart:', cartError);
              }
              window.location.href = `/order-success?name=${encodeURIComponent(`${customerInfo.firstName} ${customerInfo.lastName}`)}&email=${encodeURIComponent(customerInfo.email)}`;
            }, 2000);
          } else {
            setMessage('✅ Pago exitoso. Te contactaremos con los enlaces de descarga.');
            setTimeout(() => {
              window.location.href = `/order-success?name=${encodeURIComponent(`${customerInfo.firstName} ${customerInfo.lastName}`)}&email=${encodeURIComponent(customerInfo.email)}`;
            }, 3000);
          }
        } catch (emailError) {
          setMessage('✅ Pago exitoso. Te contactaremos con los enlaces de descarga.');
          setTimeout(() => {
            window.location.href = `/order-success?name=${encodeURIComponent(`${customerInfo.firstName} ${customerInfo.lastName}`)}&email=${encodeURIComponent(customerInfo.email)}`;
          }, 3000);
        }
      }
    } catch (err) {
      setMessage('Error procesando el pago. Intenta nuevamente.');
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ 
          backgroundColor: 'white', 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(to right, #2563eb, #9333ea)',
            color: 'white',
            padding: '24px'
          }}>
            <h3 style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '18px',
              fontWeight: '600',
              margin: '0'
            }}>
              <span>👤</span>
              <span>Información Personal</span>
            </h3>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Nombre *
                </label>
                <input 
                  type="text" 
                  required
                  value={customerInfo.firstName}
                  onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Apellido *
                </label>
                <input 
                  type="text" 
                  required
                  value={customerInfo.lastName}
                  onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  placeholder="Tu apellido"
                />
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                <span style={{ marginRight: '4px' }}>📧</span>
                Email *
              </label>
              <input 
                type="email" 
                required
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
                placeholder="tu@email.com"
              />
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', margin: '4px 0 0 0' }}>
                Los enlaces de descarga se enviarán a este email
              </p>
            </div>
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(to right, #2563eb, #9333ea)',
            color: 'white',
            padding: '24px'
          }}>
            <h3 style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '18px',
              fontWeight: '600',
              margin: '0'
            }}>
              <span>💳</span>
              <span>Información de Pago</span>
            </h3>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{
              padding: '16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: 'white',
              marginBottom: '16px'
            }}>
              <PaymentElement 
                options={{
                  layout: 'accordion',
                  paymentMethodOrder: ['card'],
                  fields: { billingDetails: 'never' },
                  terms: { card: 'never' },
                  wallets: { applePay: 'never', googlePay: 'never' }
                }}
              />
            </div>
            
            {message && (
              <div style={{
                padding: '16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '16px',
                backgroundColor: message.includes('✅') ? '#dcfce7' : '#fee2e2',
                color: message.includes('✅') ? '#166534' : '#991b1b',
                border: message.includes('✅') ? '1px solid #bbf7d0' : '1px solid #fecaca'
              }}>
                {message}
              </div>
            )}

            {processingStep && (
              <div style={{
                padding: '16px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #2563eb',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <p style={{ color: '#1e40af', fontSize: '14px', fontWeight: '500', margin: '0' }}>
                    {processingStep}
                  </p>
                </div>
              </div>
            )}

            <div style={{
              background: 'linear-gradient(to right, #eff6ff, #f3e8ff)',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
              marginBottom: '16px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', margin: '0 0 8px 0' }}>
                  Total a pagar
                </p>
                <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#2563eb', margin: '0' }}>
                  {formatCurrency(total)}
                </p>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!stripe || isProcessing || !customerInfo.email}
              style={{
                width: '100%',
                background: isProcessing ? '#6b7280' : 'linear-gradient(to right, #2563eb, #9333ea)',
                color: 'white',
                padding: '16px',
                fontSize: '18px',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: (!stripe || isProcessing || !customerInfo.email) ? 0.5 : 1
              }}
            >
              {isProcessing ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '8px'
                  }}></div>
                  {processingStep || 'Procesando...'}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ marginRight: '8px' }}>🔒</span>
                  Completar Compra Segura
                </div>
              )}
            </button>
          </div>
        </div>
      </form>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function SimpleHeader() {
  return (
    <header style={{
      backgroundColor: 'white',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            <span style={{ color: '#eab308' }}>Audio</span>
            <span style={{ color: '#2563eb' }}>Motívate</span>
          </div>
        </a>
      </div>
    </header>
  );
}

export default function Checkout() {
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState<string | null>(null);
  
  const [testimonials, setTestimonials] = useState<any[]>([]);

  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Load cart data
    fetch('/api/cart')
      .then(response => {
        if (!response.ok) throw new Error('Failed to load cart');
        return response.json();
      })
      .then((data: CartResponse) => {
        setCartData(data);
        setCartLoading(false);
      })
      .catch(error => {
        setCartError(error.message);
        setCartLoading(false);
      });

    // Load testimonials
    fetch('/api/testimonials')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTestimonials(data);
        }
      })
      .catch(error => {
        console.warn('Failed to load testimonials:', error);
      });
  }, []);

  const cartItems = cartData?.items || [];
  const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  useEffect(() => {
    if (total > 0) {
      setLoading(true);
      setError('');

      const timeoutId = setTimeout(() => {
        setError('Tiempo de espera agotado. Por favor recarga la página.');
        setLoading(false);
      }, 30000);

      fetch('/api/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ amount: total, currency: 'mxn' }),
      })
      .then(response => {
        clearTimeout(timeoutId);
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          });
        }
        return response.json();
      })
      .then(data => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error('No se recibió clientSecret del servidor');
        }
        setLoading(false);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        setError(`Error al preparar el pago: ${error.message}`);
        setLoading(false);
      });

      return () => clearTimeout(timeoutId);
    }
  }, [total]);

  if (!stripePromise) {
    return (
      <>
        <SimpleHeader />
        <main style={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom right, #f9fafb, #eff6ff)',
          paddingTop: '96px',
          paddingBottom: '48px'
        }}>
          <div style={{ maxWidth: '512px', margin: '0 auto', padding: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '48px' }}>⚠️</span>
            <p style={{ color: '#dc2626', marginBottom: '16px', marginTop: '16px' }}>
              Error de configuración de pagos
            </p>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '8px 24px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Recargar página
            </button>
          </div>
        </main>
      </>
    );
  }

  if (cartLoading) {
    return (
      <>
        <SimpleHeader />
        <main style={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom right, #f9fafb, #eff6ff)',
          paddingTop: '96px',
          paddingBottom: '48px'
        }}>
          <div style={{ maxWidth: '512px', margin: '0 auto', padding: '16px', textAlign: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '2px solid #2563eb',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
            <p style={{ marginTop: '16px', color: '#6b7280' }}>Cargando carrito...</p>
          </div>
        </main>
      </>
    );
  }

  if (cartError) {
    return (
      <>
        <SimpleHeader />
        <main style={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom right, #f9fafb, #eff6ff)',
          paddingTop: '96px',
          paddingBottom: '48px'
        }}>
          <div style={{ maxWidth: '512px', margin: '0 auto', padding: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '48px' }}>⚠️</span>
            <p style={{ color: '#dc2626', marginBottom: '16px', marginTop: '16px' }}>
              Error cargando el carrito
            </p>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '8px 24px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Recargar página
            </button>
          </div>
        </main>
      </>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <SimpleHeader />
        <main style={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom right, #f9fafb, #eff6ff)',
          paddingTop: '96px',
          paddingBottom: '48px'
        }}>
          <div style={{ maxWidth: '512px', margin: '0 auto', padding: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '80px' }}>🛍️</span>
            <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '16px', marginTop: '16px' }}>
              Tu carrito está vacío
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '32px', fontSize: '18px' }}>
              Añade algunos productos antes de proceder al checkout.
            </p>
            <a 
              href="/" 
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '12px 32px',
                fontSize: '18px',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Continuar Comprando
            </a>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SimpleHeader />
      <main style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #f9fafb, #eff6ff)',
        paddingTop: '96px',
        paddingBottom: '48px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#eab308', marginRight: '8px' }}>⭐</span>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                background: 'linear-gradient(to right, #2563eb, #9333ea)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: '0'
              }}>
                La Inversión en tí es sin duda, la Mejor Inversión.
              </h1>
              <span style={{ color: '#eab308', marginLeft: '8px' }}>⭐</span>
            </div>
            <p style={{ fontSize: '16px', color: '#374151', maxWidth: '512px', margin: '0 auto' }}>
              Completa tu compra y recibe instantáneamente el contenido que te ayudará a alcanzar tus metas
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{
                backgroundColor: 'white',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: 'linear-gradient(to right, #2563eb, #9333ea)',
                  color: 'white',
                  padding: '24px'
                }}>
                  <h3 style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '18px',
                    fontWeight: '600',
                    margin: '0'
                  }}>
                    <span>🛍️</span>
                    <span>Resumen del Pedido</span>
                  </h3>
                </div>
                <div style={{ padding: '20px' }}>
                  {cartItems.map((item) => (
                    <div key={item.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      marginBottom: '12px'
                    }}>
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.title}
                        style={{
                          width: '64px',
                          height: '80px',
                          objectFit: 'contain',
                          backgroundColor: '#f9fafb',
                          borderRadius: '8px',
                          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <div style={{ flex: '1' }}>
                        <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '4px', fontSize: '14px', margin: '0 0 4px 0' }}>
                          {item.product.title}
                        </h3>
                        <p style={{ fontSize: '12px', color: '#6b7280', textTransform: 'capitalize', marginBottom: '4px', margin: '0 0 4px 0' }}>
                          {item.product.type === 'audiobook' ? 'Audiolibro' : 
                           item.product.type === 'audio' ? 'Audio' : 
                           item.product.type === 'guide' ? 'Guía' : 'Script'}
                        </p>
                        <p style={{ fontSize: '12px', color: '#2563eb', fontWeight: '500', margin: '0' }}>
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 'bold', fontSize: '16px', color: '#111827', margin: '0' }}>
                          {formatCurrency(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <div style={{
                    backgroundColor: '#eff6ff',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #bfdbfe',
                    marginTop: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                      <span>Total:</span>
                      <span style={{ color: '#2563eb' }}>{formatCurrency(total)}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', marginTop: '8px', margin: '8px 0 0 0' }}>
                      * Precios en pesos mexicanos (MXN)
                    </p>
                  </div>
                </div>
              </div>

              {testimonials && testimonials.length > 0 && (
                <div style={{
                  backgroundColor: 'white',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: 'linear-gradient(to right, #059669, #2563eb)',
                    color: 'white',
                    padding: '24px'
                  }}>
                    <h3 style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '18px',
                      fontWeight: '600',
                      margin: '0'
                    }}>
                      <span>⭐</span>
                      <span>Lo que dicen nuestros clientes</span>
                    </h3>
                  </div>
                  <div style={{ padding: '20px' }}>
                    {testimonials.slice(0, 3).map((testimonial, index) => (
                      <div key={testimonial.id || index} style={{
                        padding: '16px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        marginBottom: '16px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{ flex: '1' }}>
                            <p style={{ fontSize: '14px', color: '#374151', marginBottom: '8px', margin: '0 0 8px 0' }}>
                              "{testimonial.content}"
                            </p>
                            <p style={{ fontSize: '12px', fontWeight: '500', color: '#2563eb', margin: '0' }}>
                              - {testimonial.name}
                            </p>
                          </div>
                          <div style={{ display: 'flex', color: '#eab308' }}>
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>⭐</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              {error ? (
                <div style={{ textAlign: 'center', padding: '32px' }}>
                  <span style={{ fontSize: '48px' }}>⚠️</span>
                  <p style={{ color: '#dc2626', marginBottom: '16px', marginTop: '16px' }}>{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '8px 24px',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Reintentar
                  </button>
                </div>
              ) : loading || !clientSecret ? (
                <div style={{ textAlign: 'center', padding: '32px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    border: '2px solid #2563eb',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto'
                  }}></div>
                  <p style={{ marginTop: '16px', color: '#6b7280' }}>Preparando el pago...</p>
                </div>
              ) : (
                <Elements 
                  stripe={stripePromise} 
                  options={{ 
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#2563eb',
                        fontFamily: 'system-ui, sans-serif',
                      }
                    },
                    mode: 'payment',
                    currency: 'mxn'
                  }}
                >
                  <CheckoutForm total={total} cartItems={cartItems} />
                </Elements>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
