import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeSupabase } from '@stableos/shared';
import './styles/index.css';

// Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'ERROR: Supabase configuration missing! Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
  );
  alert('Supabase not configured! Check console.');
} else {
  console.log('Initializing Supabase...');
  initializeSupabase(supabaseUrl, supabaseKey);
  console.log('Supabase initialized successfully!');
}

// Register service worker for PWA offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('Service Worker registration failed:', err);
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
