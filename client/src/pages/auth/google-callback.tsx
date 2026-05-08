import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    // Debug logging
    console.log('Google Callback - URL params:', { code, error });
    console.log('Full URL:', window.location.href);

    const closeWindow = () => {
      // Try to close window, but handle Cross-Origin-Opener-Policy restriction
      try {
        window.close();
      } catch (error) {
        console.log('Window close blocked by Cross-Origin-Opener-Policy');
        // Fallback: redirect to sign-in page after a delay
        setTimeout(() => {
          window.location.href = '/sign-up';
        }, 2000);
      }
    };

    const sendMessage = (message: any) => {
      try {
        window.opener?.postMessage(message, window.location.origin);
      } catch (error) {
        console.log('PostMessage blocked, will redirect instead');
      }
    };

    if (error) {
      // Handle OAuth error
      console.log('OAuth error:', error);
      sendMessage({
        type: 'GOOGLE_AUTH_ERROR',
        error: error
      });
      closeWindow();
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
            sendMessage({
              type: 'GOOGLE_AUTH_SUCCESS',
              token: data.token
            });
            closeWindow();
          } else {
            sendMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: 'Failed to exchange code for token'
            });
            closeWindow();
          }
        })
        .catch(error => {
          console.error('Token exchange error:', error);
          sendMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: 'Failed to exchange code for token'
          });
          closeWindow();
        });
    } else {
      // No code or error parameter
      sendMessage({
        type: 'GOOGLE_AUTH_ERROR',
        error: 'No authorization code received'
      });
      closeWindow();
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing Google authentication...</p>
        <p className="text-sm text-muted-foreground mt-2">This window will close automatically</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
