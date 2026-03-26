import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './assets/styles.css'; // This imports your SwapNest colors!

// 1. Import the Google Provider
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Wrap your App. Make sure to paste your real Client ID here! */}
    <GoogleOAuthProvider clientId="653468037105-k1n5270va330m6vutccqiapii1khesfn.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)