import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppDispatch } from "@/app/hook";
import { setCredentials } from "@/features/auth/authSlice";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');
    
    // Debug logging
    console.log('Google Callback - URL params:', { code, error, state });
    console.log('Full URL:', window.location.href);

    // Verify state to prevent CSRF attacks
    const storedState = sessionStorage.getItem('google_oauth_state');
    const action = sessionStorage.getItem('google_oauth_action');
    
    if (state !== storedState) {
      console.error('State mismatch - possible CSRF attack');
      navigate('/sign-up');
      return;
    }

    if (error) {
      // Handle OAuth error
      console.log('OAuth error:', error);
      toast.error("Google authentication cancelled or failed");
      navigate('/sign-up');
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
            // Clear session storage
            sessionStorage.removeItem('google_oauth_state');
            sessionStorage.removeItem('google_oauth_action');
            
            toast.success("Google authentication successful!");
            console.log("Google auth result:", data);
            
            // Store authentication data in Redux for immediate login
            if (data.user) {
              // Dispatch credentials to Redux store
              dispatch(setCredentials(data));
            }
            
            // Redirect based on the original action
            setTimeout(() => {
              if (action === 'signin') {
                navigate('/overview');
              } else {
                // For signup, redirect to sign-in page
                navigate('/');
              }
            }, 1000);
          } else {
            toast.error("Failed to authenticate with Google");
            navigate('/sign-up');
          }
        })
        .catch(error => {
          console.error('Token exchange error:', error);
          toast.error("Failed to authenticate with Google");
          navigate('/sign-up');
        });
    } else {
      // No code or error parameter
      toast.error("No authorization code received");
      navigate('/sign-up');
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing Google authentication...</p>
        <p className="text-sm text-muted-foreground mt-2">You will be redirected automatically</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
