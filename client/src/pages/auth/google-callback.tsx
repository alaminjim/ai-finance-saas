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
    
    
    // Verify state to prevent CSRF attacks
    const storedState = sessionStorage.getItem('google_oauth_state');
    
    if (state !== storedState) {
      navigate('/sign-up');
      return;
    }

    if (error) {
      // Handle OAuth error
      toast.error("Google authentication cancelled or failed");
      navigate('/sign-up');
      return;
    }

    if (code) {
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
          if (data.token && data.user) {
            console.log('Google auth successful, preparing redirect...');
            console.log('User data:', data.user);
            console.log('Token received:', data.token);
            
            // Clear session storage
            sessionStorage.removeItem('google_oauth_state');
            sessionStorage.removeItem('google_oauth_action');
            
            // Store authentication data in Redux for immediate login
            dispatch(setCredentials({
              user: data.user,
              accessToken: data.token,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
            }));
            
            console.log('Redux credentials dispatched');
            toast.success("Google authentication successful!");
            
            // Redirect immediately after setting credentials
            setTimeout(() => {
              console.log('Attempting to navigate to /overview');
              // Try both React Router and window.location
              try {
                navigate('/overview', { replace: true });
                console.log('React Router navigation called');
              } catch (error) {
                console.log('React Router failed, using window.location');
              }
              // Fallback to force redirect
              window.location.href = '/overview';
              console.log('Window location redirect called');
            }, 300);
          } else {
            toast.error("Failed to authenticate with Google");
            navigate('/sign-up');
          }
        })
        .catch(() => {
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
