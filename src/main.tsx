import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ToastProvider } from './contexts/ToastContext.tsx';
import { Toast } from './components/ui/Toast.tsx'; // Assuming this is the Toast component

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
      <Toast /> {/* Render the Toast component here */}
    </ToastProvider>
  </StrictMode>
);