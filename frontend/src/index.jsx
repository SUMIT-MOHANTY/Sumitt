import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// For older React versions
const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    // React 18 approach
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    // Fallback for older React versions
    console.warn('Using legacy ReactDOM.render() as createRoot() failed:', error);
    ReactDOM.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
      rootElement
    );
  }
} else {
  console.error('Root element not found. Make sure there is a div with id="root" in your HTML.');
}
