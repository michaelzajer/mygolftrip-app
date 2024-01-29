// This is src/serviceWorkerRegistration.js

export function register() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        const swUrl = `${process.env.PUBLIC_URL}/sw.js`;
        navigator.serviceWorker
          .register(swUrl)
          .then(registration => {
            console.log('Service Worker registered: ', registration);
          })
          .catch(registrationError => {
            console.log('Service Worker registration failed: ', registrationError);
          });
      });
    }
  }
  
  // Include other service worker lifecycle handling as needed