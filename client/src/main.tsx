import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("🔍 DEBUGGING - main.tsx loaded");
console.log("🔍 DEBUGGING - document:", !!document);
console.log("🔍 DEBUGGING - document.getElementById:", !!document.getElementById);

const rootElement = document.getElementById("root");
console.log("🔍 DEBUGGING - root element:", rootElement);

if (!rootElement) {
  console.error("❌ DEBUGGING - ROOT ELEMENT NOT FOUND!");
  document.body.innerHTML = '<div style="background: red; color: white; padding: 20px;">ERROR: Root element not found</div>';
} else {
  console.log("✅ DEBUGGING - Creating React root...");
  try {
    const root = createRoot(rootElement);
    console.log("✅ DEBUGGING - React root created, rendering App...");
    root.render(<App />);
    console.log("✅ DEBUGGING - App rendered successfully");
  } catch (error) {
    console.error("❌ DEBUGGING - Error creating root or rendering:", error);
    document.body.innerHTML = `<div style="background: red; color: white; padding: 20px;">ERROR: ${error}</div>`;
  }
}
