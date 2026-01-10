import { useState, useEffect } from 'react';
import * as dotenv from 'dotenv';
dotenv.config();

const oathkey = process.env.VITE_GOOGLE_CLIENT_ID;

// Types for Google Identity Services
interface GoogleUser {
  credential: string;
  clientId: string;
  select_by: string;
}

interface DecodedToken {
  email: string;
  name: string;
  picture: string;
  sub: string;
  email_verified: boolean;
}

function App() {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Replace with your actual Google Client ID
  const GOOGLE_CLIENT_ID = oathkey;

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      // Initialize Google Sign-In
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        // Render the sign-in button
        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInButton'),
          {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
          }
        );

        // Also prompt for one-tap sign-in
        window.google.accounts.id.prompt();
      }
      setIsLoading(false);
    };

    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = (response: GoogleUser) => {
    // Decode the JWT token to get user info
    const decoded = parseJwt(response.credential);
    setUser(decoded);
    
    // Store user info in localStorage (or send to your backend)
    localStorage.setItem('user', JSON.stringify(decoded));
    
    console.log('User signed in:', decoded);
    // Here you would typically send the credential to your backend
    // sendTokenToBackend(response.credential);
  };

  const parseJwt = (token: string): DecodedToken => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  };

  const handleSignOut = () => {
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
    setUser(null);
    localStorage.removeItem('user');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Google Sign-In Demo
          </h1>

          {!user ? (
            <div className="space-y-4">
              <p className="text-gray-600 text-center mb-6">
                Sign in with your Google account to continue
              </p>
              <div className="flex justify-center">
                <div id="googleSignInButton"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-500"
                />
                <h2 className="text-xl font-semibold text-gray-900">
                  Welcome, {user.name}!
                </h2>
                <p className="text-gray-600 mt-2">{user.email}</p>
                {user.email_verified && (
                  <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  User Information:
                </h3>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-gray-600">User ID:</dt>
                    <dd className="text-gray-900 font-mono break-all">
                      {user.sub}
                    </dd>
                  </div>
                </dl>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Remember to replace{' '}
            <code className="bg-gray-200 px-2 py-1 rounded">
              YOUR_GOOGLE_CLIENT_ID
            </code>{' '}
            with your actual Google Client ID
          </p>
        </div>
      </div>
    </div>
  );
}

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    google: any;
  }
}

export default App;