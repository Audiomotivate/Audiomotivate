import { createRoot } from "react-dom/client";
import App from "../client/src/App";
import "../client/src/index.css";
import { CartProvider } from "../client/src/providers/cart-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../client/src/lib/queryClient";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <App />
    </CartProvider>
  </QueryClientProvider>
);
