import React from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import Home from "./pages/home";

function TestPage() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue' }}>
      <h1>Test Page</h1>
      <p>Simple fallback page working</p>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/test" component={TestPage} />
      <Route>
        <div style={{ padding: '20px', backgroundColor: 'lightyellow' }}>
          <h1>404 - Not Found</h1>
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
          <h3>Home Component Test - {new Date().toISOString()}</h3>
          <p>Testing real Home component - if this shows but page is blank below, Home component has an error</p>
        </div>
        <Router />
      </div>
    </QueryClientProvider>
  );
}

export default App;
