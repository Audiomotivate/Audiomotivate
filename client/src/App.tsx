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
const TermsOfService = lazy(() => import('./pages/terms-of-service'));
const PrivacyPolicy = lazy(() => import('./pages/privacy-policy'));
const RefundPolicy = lazy(() => import('./pages/refund-policy'));
const CookiePolicy = lazy(() => import('./pages/cookie-policy'));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/audiolibros" component={AllAudiobooks} />
      <Route path="/audios" component={AllAudios} />
      <Route path="/pdfs">
        <Suspense fallback={<div className="p-12 text-center">Cargando...</div>}>
          <AllScripts />
        </Suspense>
      </Route>
      <Route path="/scripts">
        <Suspense fallback={<div className="p-12 text-center">Cargando...</div>}>
          <AllScripts />
        </Suspense>
      </Route>
      <Route path="/guias">
        <Suspense fallback={<div className="p-12 text-center">Cargando...</div>}>
          <AllGuides />
        </Suspense>
      </Route>
      <Route path="/cart">
        <Suspense fallback={<div className="p-12 text-center">Cargando...</div>}>
          <CartPage />
        </Suspense>
      </Route>
      <Route path="/admin">
        <Suspense fallback={<div className="p-12 text-center">Cargando...</div>}>
          <AdminPanel />
        </Suspense>
      </Route>
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-success" component={OrderSuccess} />
      <Route path="/product/:id">
        <Suspense fallback={<div className="p-12 text-center">Cargando...</div>}>
          <ProductDetail />
        </Suspense>
      </Route>
      <Route path="/terminos">
        <Suspense fallback={<div className="p-12 text-center">Cargando...</div>}>
          <TermsOfService />
        </Suspense>
      </Route>
      <Route path="/privacidad">
        <Suspense fallback={<div className="p-12 text-center">Cargando...</div>}>
          <PrivacyPolicy />
        </Suspense>
      </Route>
      <Route path="/reembolsos">
        <Suspense fallback={<div className="p-12 text-center">Cargando...</div>}>
          <RefundPolicy />
        </Suspense>
      </Route>
      <Route path="/cookies">
        <Suspense fallback={<div className="p-12 text-center">Cargando...</div>}>
          <CookiePolicy />
        </Suspense>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Update document title
  useEffect(() => {
    document.title = "Audio Motívate - Audiolibros y Contenido Motivacional";
    
    // Add meta description
    const metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = 'Descubre audiolibros de desarrollo personal, videos de superación personal y contenido inspirador para transformar tu vida con Audio Motívate.';
    document.head.appendChild(metaDescription);
    
    // Open Graph tags
    const ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.content = 'Audio Motívate - Audiolibros y Contenido Motivacional';
    document.head.appendChild(ogTitle);
    
    const ogDescription = document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.content = 'Descubre audiolibros de desarrollo personal, videos de superación personal y contenido inspirador para transformar tu vida con Audio Motívate.';
    document.head.appendChild(ogDescription);
    
    const ogType = document.createElement('meta');
    ogType.setAttribute('property', 'og:type');
    ogType.content = 'website';
    document.head.appendChild(ogType);
    
    return () => {
      document.head.removeChild(metaDescription);
      document.head.removeChild(ogTitle);
      document.head.removeChild(ogDescription);
      document.head.removeChild(ogType);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Router />
        <LocationPopup />
        <CartDrawer />
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
