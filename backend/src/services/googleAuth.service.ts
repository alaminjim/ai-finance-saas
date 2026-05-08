import { HttpException } from "../utils/app-error";
import { HTTPSTATUS } from "../config/http.config";
import { Env } from "../config/env.config";
import { OAuth2Client } from "google-auth-library";

const oauth2Client = new OAuth2Client(
  Env.GOOGLE_CLIENT_ID,
  Env.GOOGLE_CLIENT_SECRET,
  Env.FRONTEND_ORIGIN
);

export const googleAuthService = {
  async verifyGoogleToken(token: string) {
    try {
      const ticket = await oauth2Client.verifyIdToken({
        idToken: token,
        audience: Env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) {
        throw new HttpException("Invalid Google token", HTTPSTATUS.UNAUTHORIZED);
      }

      return {
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture,
        googleId: payload.sub,
      };
    } catch (error) {
      throw new HttpException("Failed to verify Google token", HTTPSTATUS.UNAUTHORIZED);
    }
  },

  async exchangeCodeForTokens(code: string) {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      const idToken = tokens.id_token;
      
      if (!idToken) {
        throw new HttpException("Failed to get ID token from authorization code", HTTPSTATUS.UNAUTHORIZED);
      }

      // Verify the ID token and get user info
      const ticket = await oauth2Client.verifyIdToken({
        idToken: idToken,
        audience: Env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) {
        throw new HttpException("Invalid Google token", HTTPSTATUS.UNAUTHORIZED);
      }

      return {
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture,
        googleId: payload.sub,
        tokens: tokens,
      };
    } catch (error) {
      console.error('Code exchange error:', error);
      throw new HttpException("Failed to exchange authorization code", HTTPSTATUS.UNAUTHORIZED);
    }
  },

  getGoogleAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo/profile',
    ];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      redirect_uri: `${Env.FRONTEND_ORIGIN}/auth/google/callback`,
    });
  }
};
