import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "@/routes/common/routePath";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { useLoginMutation } from "@/features/auth/authAPI";
import { useAppDispatch } from "@/app/hook";
import { setCredentials } from "@/features/auth/authSlice";
import GoogleAuthButton from "@/components/ui/google-auth-button";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

const SignInForm = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: FormValues) => {
    login(values)
      .unwrap()
      .then((data) => {
        dispatch(setCredentials({
          ...data,
          expiresAt: data.expiresAt ? new Date(data.expiresAt).getTime() : null,
        }));
        toast.success("Login successful");
        setTimeout(() => {
          navigate(PROTECTED_ROUTES.OVERVIEW);
        }, 1000);
      })
      .catch((error) => {
        toast.error(error.data?.message || "Failed to login");
      });
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      // Use redirect-based OAuth flow instead of popup to avoid Cross-Origin-Opener-Policy issues
      const state = Math.random().toString(36).substring(7);
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(`${window.location.origin}/auth/google/callback`)}&` +
        `response_type=code&` +
        `scope=openid email profile&` +
        `state=${state}&` +
        `access_type=offline&` +
        `prompt=consent`;
      
      // Store the state in sessionStorage to verify on callback
      sessionStorage.setItem('google_oauth_state', state);
      sessionStorage.setItem('google_oauth_action', 'signin');
      
      // Redirect to Google OAuth directly (no popup)
      window.location.href = authUrl;
    } catch (error) {
      setIsGoogleLoading(false);
      toast.error("Failed to initialize Google Sign-In");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="!font-normal">Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="!font-normal">Password</FormLabel>
                  <FormControl>
                    <Input placeholder="*******" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={isLoading} type="submit" className="w-full">
            {isLoading && <Loader className="h-4 w-4 animate-spin" />}
            Login
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <GoogleAuthButton
            isLoading={isGoogleLoading}
            onClick={handleGoogleSignIn}
          >
            Continue with Google
          </GoogleAuthButton>
        </div>
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            to={AUTH_ROUTES.SIGN_UP}
            className="underline underline-offset-4"
          >
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
};

export default SignInForm;
