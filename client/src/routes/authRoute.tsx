import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useTypedSelector } from "@/app/hook";
import { PROTECTED_ROUTES } from "./common/routePath";

import { BrandLoader } from "@/components/ui/brand-loader";

const AuthRoute = () => {
  const { accessToken, user } = useTypedSelector((state) => state.auth);
  const navigate = useNavigate();
  const isRestoring = accessToken === undefined && user === undefined;

  useEffect(() => {
    if (accessToken && user) {
      navigate(PROTECTED_ROUTES.OVERVIEW, { replace: true });
    }
  }, [accessToken, user, navigate]);

  if (isRestoring) return <BrandLoader />; // wait for state restore
  if (!accessToken && !user) return <Outlet />;

  return null;
};

export default AuthRoute;
