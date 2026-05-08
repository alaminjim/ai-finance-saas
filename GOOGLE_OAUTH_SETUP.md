# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your AI Financial SaaS application.

## Prerequisites

1. Google Cloud Console account
2. Your application's domain (for production) or `http://localhost:5173` (for development)

## Step 1: Create Google OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing project
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client IDs"
5. Select "Web application" as the application type
6. Add the following authorized redirect URIs:
   - Development: `http://localhost:5173/auth/google/callback`
   - Production: `https://yourdomain.com/auth/google/callback`
7. Click "Create"
8. Copy the **Client ID** and **Client Secret**

## Step 2: Backend Setup

### Install Required Packages

```bash
cd backend
npm install passport passport-google-oauth20 google-auth-library
```

### Environment Variables

Add these to your backend `.env` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
FRONTEND_ORIGIN=http://localhost:5173  # Update for production
```

### Backend Implementation

The following files have been created/updated:

1. **Backend Service**: `backend/src/services/googleAuth.service.ts`
2. **Backend Controller**: `backend/src/controllers/auth.controller.ts` (updated)
3. **Backend Routes**: `backend/src/routes/auth.route.ts` (updated)

### New Backend Endpoints

- `GET /api/auth/google/url` - Returns Google OAuth URL
- `POST /api/auth/google/callback` - Handles Google OAuth callback

## Step 3: Frontend Setup

### Environment Variables

Add these to your frontend `.env` file:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Frontend Implementation

The following files have been created/updated:

1. **Google Auth Button**: `client/src/components/ui/google-auth-button.tsx`
2. **Login Form**: `client/src/pages/auth/_component/signin-form.tsx` (updated)
3. **Signup Form**: `client/src/pages/auth/_component/signup-form.tsx` (updated)
4. **Google Callback Page**: `client/src/pages/auth/google-callback.tsx`
5. **Auth API**: `client/src/features/auth/authAPI.ts` (updated)
6. **Routes**: `client/src/routes/common/routePath.tsx` and `client/src/routes/common/routes.tsx` (updated)

## Step 4: Testing the Integration

1. Start your backend server
2. Start your frontend development server
3. Navigate to the login or signup page
4. Click the "Continue with Google" button
5. Complete the Google OAuth flow in the popup
6. Verify that the authentication works correctly

## Features Implemented

✅ Google OAuth button with Google logo
✅ OAuth flow using popup window
✅ Token verification and user authentication
✅ Error handling for failed authentication
✅ Loading states during authentication
✅ Integration with existing auth system
✅ Both login and signup pages supported

## Important Notes

1. **Production Setup**: Make sure to update the redirect URIs in Google Cloud Console for your production domain
2. **Environment Variables**: Never commit your `.env` files to version control
3. **Security**: The backend validates Google tokens to ensure authenticity
4. **User Experience**: The OAuth flow uses a popup to avoid redirecting the main page

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**: Check that the redirect URI in Google Cloud Console matches your frontend URL exactly
2. **"Client ID not found" error**: Verify that `VITE_GOOGLE_CLIENT_ID` is set correctly in your frontend `.env` file
3. **Backend token verification fails**: Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly in your backend `.env` file

### Debug Mode

To enable debug logging, add this to your backend `.env` file:

```env
DEBUG=google-auth-library
```

## Next Steps

1. Implement user profile creation/update logic in the backend
2. Add Google OAuth user data mapping to your user schema
3. Consider adding Google OAuth account linking for existing email users
4. Add proper error handling and user feedback
5. Implement session management for Google OAuth users

## Security Considerations

1. Always validate Google tokens on the backend
2. Use HTTPS in production
3. Implement proper session management
4. Consider adding CSRF protection
5. Regularly rotate your client secrets if needed
