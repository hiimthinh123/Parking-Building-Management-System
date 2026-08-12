import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

const originalFetch = window.fetch.bind(window);

window.fetch = (input, init = {}) => {
    const request = new Request(input, init);
    const url = new URL(request.url);

    const isBackendApi =
        url.origin === "http://localhost:8080" &&
        url.pathname.startsWith("/api/");

    if (!isBackendApi) {
        return originalFetch(request);
    }

    const token = localStorage.getItem("USER_TOKEN");
    const headers = new Headers(request.headers);

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    return originalFetch(new Request(request, { headers }));
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <GoogleOAuthProvider clientId="850421414212-pa96p4s13gfn8bgavvh879d1gb01s1pc.apps.googleusercontent.com">
          <App />
      </GoogleOAuthProvider>
  </StrictMode>,

)
