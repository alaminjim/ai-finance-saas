import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    // Debug logging
    console.log('Google Callback - URL params:', { code, error });
    console.log('Full URL:', window.location.href);

    if (error) {
      // Handle OAuth error
      console.log('OAuth error:', error);
      window.opener?.postMessage({
        type: 'GOOGLE_AUTH_ERROR',
        error: error
      }, window.location.origin);
      window.close();
      return;
    }

    if (code) {
      console.log('Authorization code received:', code);
      // Exchange authorization code for tokens
      fetch(`${import.meta.env.VITE_API_URL}/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.token) {
            window.opener?.postMessage({
              type: 'GOOGLE_AUTH_SUCCESS',
              token: data.token
            }, window.location.origin);
            window.close();
          } else {
            window.opener?.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: 'Failed to exchange code for token'
            }, window.location.origin);
            window.close();
          }
        })
        .catch(error => {
          console.error('Token exchange error:', error);
          window.opener?.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: 'Failed to exchange code for token'
          }, window.location.origin);
          window.close();
        });
    } else {
      // No code or error parameter
      window.opener?.postMessage({
        type: 'GOOGLE_AUTH_ERROR',
        error: 'No authorization code received'
      }, window.location.origin);
      window.close();
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing Google authentication...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
