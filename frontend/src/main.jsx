import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'
import './index.css'

const stylePolice = new MutationObserver(() => {
  const body = document.body;
  if (body.style.overflow === 'hidden') {
    body.style.overflow = 'auto';
  }
  if (body.style.paddingRight) {
    body.style.paddingRight = '0px';
  }
  if (body.getAttribute('data-scroll-locked') !== null) {
    body.removeAttribute('data-scroll-locked');
  }
  body.style.pointerEvents = 'auto';
});

stylePolice.observe(document.body, { attributes: true, attributeFilter: ['style', 'data-scroll-locked'] });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)