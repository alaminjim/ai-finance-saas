import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import AppLayout from "@/layouts/app-layout";
import BaseLayout from "@/layouts/base-layout";
import { authenticationRoutePaths, protectedRoutePaths } from "./common/routes";
import { useTypedSelector } from "@/app/hook";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "./common/routePath";
import useAuthExpiration from "@/hooks/use-auth-expiration";
import { BrandLoader } from "@/components/ui/brand-loader";

// ------------------ AuthRoute ------------------
const AuthRoute = () => {
  const { accessToken, user } = useTypedSelector((state) => state.auth);

  // Redux Persist state restore check
  if (accessToken === undefined && user === undefined) {
    return <BrandLoader />;
  }

  // If logged in, redirect to overview
  if (accessToken && user) {
    return <Navigate to={PROTECTED_ROUTES.OVERVIEW} replace />;
  }

  // Otherwise, show nested auth routes
  return <Outlet />;
};

// ------------------ ProtectedRoute ------------------
const ProtectedRoute = () => {
  const { accessToken, user } = useTypedSelector((state) => state.auth);

  // Loading state during Redux Persist restore
  if (accessToken === undefined && user === undefined) {
    return <BrandLoader />;
  }

  // If not logged in, redirect to login
  if (!accessToken || !user) {
    return <Navigate to={AUTH_ROUTES.SIGN_IN} replace />;
  }

  return <Outlet />;
};

// ------------------ AppRoutes ------------------
function AppRoutes() {
  useAuthExpiration(); // handle token expiration

  return (
    <BrowserRouter>
      <React.Suspense fallback={<BrandLoader />}>
        <Routes>
          {/* Public / Authentication Routes */}
          <Route element={<AuthRoute />}>
            <Route element={<BaseLayout />}>
              {authenticationRoutePaths.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
            </Route>
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {protectedRoutePaths.map((route) => (
                <Route key={route.path} path={route.path} element={route.element}>
                  {route.children?.map((child) => (
                    <Route
                      key={child.path || "index"}
                      index={child.index}
                      path={child.path}
                      element={child.element}
                    />
                  ))}
                </Route>
              ))}
            </Route>
          </Route>

          {/* Catch-all 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center text-2xl">
                404 - Page Not Found
              </div>
            }
          />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;
