import React, { useState, useEffect } from 'react';

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

export default function CheckoutBasic() {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    console.log('Checkout component mounted');
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '20px', 
      backgroundColor: '#f0f8ff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <header style={{
        backgroundColor: 'white',
        padding: '16px',
        marginBottom: '32px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            <span style={{ color: '#eab308' }}>Audio</span>
            <span style={{ color: '#2563eb' }}>Motívate</span>
          </div>
        </a>
      </header>

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          textAlign: 'center',
          color: '#2563eb',
          marginBottom: '24px',
          fontSize: '28px'
        }}>
          Checkout - En Construcción
        </h1>

        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <p style={{ margin: '0', color: '#92400e' }}>
            🚧 Estamos optimizando el sistema de pagos para Vercel. 
            Por favor regresa en unos minutos.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '24px'
        }}>
          <div>
            <h3 style={{ color: '#1f2937', marginBottom: '16px' }}>
              Estado del Sistema
            </h3>
            <ul style={{ listStyle: 'none', padding: '0' }}>
              <li style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                ✅ Carrito de compras: Funcionando
              </li>
              <li style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                ✅ Base de datos: Conectada
              </li>
              <li style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                ✅ APIs: Funcionando
              </li>
              <li style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                🔧 Stripe Checkout: En optimización
              </li>
            </ul>
          </div>

          <div>
            <h3 style={{ color: '#1f2937', marginBottom: '16px' }}>
              Información de Debug
            </h3>
            <div style={{
              backgroundColor: '#f3f4f6',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>
              <div>Mounted: {mounted ? 'true' : 'false'}</div>
              <div>Stripe Key: {STRIPE_PUBLIC_KEY ? 'Configured' : 'Missing'}</div>
              <div>Build: {new Date().toISOString()}</div>
              <div>Environment: Production</div>
              <div>Version: 2.0</div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <a 
            href="/"
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Volver al Inicio
          </a>
        </div>
      </div>
    </div>
  );
}
