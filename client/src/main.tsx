import { createRoot } from "react-dom/client";
import App from "./App-simple";
// Temporarily commented out CSS to test if it's blocking render
// import "./index.css";

// Ensure DOM is ready before mounting React
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const rootElement = document.getElementById("root");
    if (rootElement) {
      createRoot(rootElement).render(<App />);
    }
  });
} else {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(<App />);
  }
}
