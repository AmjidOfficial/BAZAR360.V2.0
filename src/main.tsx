import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Progressive Web App Service Worker ONLY in production
if ('serviceWorker' in navigator) {
  if (process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('BAZAR360 PWA Service Worker registered successfully:', reg.scope);
        })
        .catch((err) => {
          console.error('BAZAR360 PWA Service Worker registration failed:', err);
        });
    });
  } else {
    // In dev mode, unregister any existing service workers to avoid stale caching and Firestore interception issues
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then((success) => {
          if (success) {
            console.log('Stale Dev Service Worker unregistered successfully');
          }
        });
      }
    });
  }
}

