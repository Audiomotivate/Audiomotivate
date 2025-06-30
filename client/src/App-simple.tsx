import React from "react";

function App() {
  return React.createElement('div', 
    { style: { padding: '20px', textAlign: 'center', backgroundColor: 'white', color: 'black' } },
    React.createElement('h1', null, 'Audio Motívate - Test'),
    React.createElement('p', null, 'Si ves esto, React está funcionando correctamente.'),
    React.createElement('p', null, `Versión sin QueryClient - ${new Date().toISOString()}`)
  );
}

export default App;
