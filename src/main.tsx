import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './crypto/secureFetch'; // Activate global fetch interceptor
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
