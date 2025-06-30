import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/home";
import NotFound from "./pages/not-found";
import AllAudiobooks from "./pages/all-audiobooks";
import AllAudios from "./pages/all-audios";
import Checkout from "./pages/checkout";
import CartDrawer from "./components/cart-drawer";
import { CartProvider } from "./providers/cart-provider";
import CartPage from './pages/cart-page';
import AllScripts from './pages/all-scripts';
import AllGuides from './pages/all-guides';
import AdminPanel from './pages/admin-simple';
import OrderSuccess from './pages/order-success';
import ProductDetail from './pages/product-detail';
import TermsOfService from './pages/terms-of-service';
import PrivacyPolicy from './pages/privacy-policy';
import RefundPolicy from './pages/refund-policy';
import CookiePolicy from './pages/cookie-policy';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/audiolibros" component={AllAudiobooks} />
      <Route path="/audios" component={AllAudios} />
      <Route path="/guias" component={AllGuides} />
      <Route path="/scripts" component={AllScripts} />
      <Route path="/cart" component={CartPage} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-success" component={OrderSuccess} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/terminos" component={TermsOfService} />
      <Route path="/privacidad" component={PrivacyPolicy} />
      <Route path="/reembolsos" component={RefundPolicy} />
      <Route path="/cookies" component={CookiePolicy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <div className="min-h-screen bg-white">
          <Router />
          <CartDrawer />
        </div>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
