import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "./store";
import { toast } from "sonner";

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || "https://ai-finance-saas-th6o.onrender.com/api",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const auth = (getState() as RootState).auth;
    if (auth?.accessToken) {
      headers.set("Authorization", `Bearer ${auth.accessToken}`);
    }
    return headers;
  },
});

const baseQueryWithErrorHandling = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQueryWithAuth(args, api, extraOptions);
  
  if (result.error?.status === 402) {
    // Payment Required - show toast and redirect to billing page
    toast.error("Premium subscription required to access this feature");
    setTimeout(() => {
      window.location.href = '/billing';
    }, 1500);
  }
  
  return result;
};

export const apiClient = createApi({
  reducerPath: "api", // Add API client reducer to root reducer
  baseQuery: baseQueryWithErrorHandling,
  refetchOnMountOrArgChange: true, // Refetch on mount or arg change
  tagTypes: ["transactions", "analytics", "billingSubscription"], // Tag types for RTK Query
  endpoints: () => ({}), // Endpoints for RTK Query
});
