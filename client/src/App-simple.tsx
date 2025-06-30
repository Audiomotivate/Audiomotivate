import React from "react";

function App() {
  return (
    <div style={{ padding: '20px', textAlign: 'center', backgroundColor: 'white', color: 'black' }}>
      <h1>Audio Motívate - Test</h1>
      <p>Si ves esto, React está funcionando correctamente.</p>
      <p>Versión sin QueryClient - {new Date().toISOString()}</p>
    </div>
  );
}

export default App;
