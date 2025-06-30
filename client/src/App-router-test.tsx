import React from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Simple test component
function TestHome() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightgreen' }}>
      <h1>Home Page Test</h1>
      <p>Router is working correctly</p>
    </div>
  );
}

function TestAbout() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue' }}>
      <h1>About Page Test</h1>
      <p>Multiple routes working</p>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={TestHome} />
      <Route path="/about" component={TestAbout} />
      <Route>
        <div style={{ padding: '20px', backgroundColor: 'lightyellow' }}>
          <h1>404 - Not Found</h1>
          <p>Default route working</p>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <div style={{ padding: '10px', backgroundColor: 'lightgray' }}>
          <h3>Router Test - {new Date().toISOString()}</h3>
          <p>Testing Wouter router with simple components</p>
        </div>
        <Router />
      </div>
    </QueryClientProvider>
  );
}

export default App;
