import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeSupabase } from '@stableos/shared';
import './styles/index.css';

// Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('========== DIAGNOSTICS: Environment Variables ==========');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase URL length:', supabaseUrl?.length || 0);
console.log('Supabase URL type:', typeof supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);
console.log('Supabase Key length:', supabaseKey?.length || 0);
console.log('Full Supabase Key:', supabaseKey);
console.log('========================================================');

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'ERROR: Supabase configuration missing! Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
  );
  alert('Supabase not configured! Check console.');
} else {
  console.log('Initializing Supabase...');
  try {
    initializeSupabase(supabaseUrl, supabaseKey);
    console.log('✅ Supabase initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
    alert('Failed to initialize Supabase: ' + (error instanceof Error ? error.message : String(error)));
  }
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
