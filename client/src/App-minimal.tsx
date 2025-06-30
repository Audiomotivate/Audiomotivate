import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ padding: '20px', textAlign: 'center', backgroundColor: 'white', color: 'black' }}>
        <h1>Audio Motívate - Minimal Test</h1>
        <p>Testing just QueryClient without router or components</p>
        <p>Timestamp: {new Date().toISOString()}</p>
      </div>
    </QueryClientProvider>
  );
}

export default App;
