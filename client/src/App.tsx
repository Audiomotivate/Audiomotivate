import React, { useEffect, lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/home";
import NotFound from "./pages/not-found";
import AllAudiobooks from "./pages/all-audiobooks";
import AllAudios from "./pages/all-audios";
import Checkout from "./pages/checkout";
import LocationPopup from "./components/location-popup";
import CartDrawer from "./components/cart-drawer";
import { CartProvider } from "./providers/cart-provider";

// Importamos los componentes de páginas dinámicamente
const CartPage = lazy(() => import('./pages/cart-page'));
const AllScripts = lazy(() => import('./pages/all-scripts'));
const AllGuides = lazy(() => import('./pages/all-guides'));
const AdminPanel = lazy(() => import('./pages/admin-simple'));
import OrderSuccess from './pages/order-success';
const ProductDetail = lazy(() => import('./pages/product-detail'));

// Páginas adicionales
const PrivacyPolicy = lazy(() => import('./pages/privacy-policy'));
const TermsOfService = lazy(() => import('./pages/terms-of-service'));
const RefundPolicy = lazy(() => import('./pages/refund-policy'));
const CookiePolicy = lazy(() => import('./pages/cookie-policy'));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/audios" component={AllAudios} />
      <Route path="/audiolibros" component={AllAudiobooks} />
      <Route path="/guias" component={AllGuides} />
      <Route path="/scripts" component={AllScripts} />
      <Route path="/carrito" component={CartPage} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/order-success" component={OrderSuccess} />
      <Route path="/producto/:id" component={ProductDetail} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/refund-policy" component={RefundPolicy} />
      <Route path="/cookie-policy" component={CookiePolicy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    const checkLocationAccess = () => {
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          if (result.state === 'granted' || result.state === 'prompt') {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                // Geolocalización exitosa
              },
              (error) => {
                // Error en geolocalización
              }
            );
          }
        });
      }
    };

    checkLocationAccess();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Suspense fallback={
            <div className="h-screen flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
            </div>
          }>
            <Router />
          </Suspense>
          <LocationPopup />
          <CartDrawer />
        </div>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
