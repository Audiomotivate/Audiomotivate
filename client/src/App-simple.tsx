import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Audio Motívate - Test</h1>
        <p>Si ves esto, React está funcionando correctamente.</p>
      </div>
    </QueryClientProvider>
  );
}

export default App;
