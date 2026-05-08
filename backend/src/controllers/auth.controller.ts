import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import { loginService, registerService } from "../services/auth.service";
import { googleAuthService } from "../services/googleAuth.service";
import { HttpException } from "../utils/app-error";
import { signJwtToken } from "../utils/jwt";

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse(req.body);

    const result = await registerService(body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "User registered successfully",
      data: result,
    });
  }
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = loginSchema.parse({
      ...req.body,
    });
    const { user, accessToken, expiresAt, reportSetting } =
      await loginService(body);

    return res.status(HTTPSTATUS.OK).json({
      message: "User logged in successfully",
      user,
      accessToken,
      expiresAt,
      reportSetting,
    });
  }
);

export const googleAuthUrlController = asyncHandler(
  async (req: Request, res: Response) => {
    const authUrl = googleAuthService.getGoogleAuthUrl();
    
    return res.status(HTTPSTATUS.OK).json({
      authUrl,
    });
  }
);

export const googleAuthCallbackController = asyncHandler(
  async (req: Request, res: Response) => {
    console.log('Google Callback Request Body:', req.body);
    const { code } = req.body;

    if (!code) {
      console.log('No authorization code received');
      throw new HttpException("Authorization code is required", HTTPSTATUS.BAD_REQUEST);
    }

    console.log('Authorization code received:', code);

    try {
      // Exchange authorization code for tokens and get user info
      const googleUser = await googleAuthService.exchangeCodeForTokens(code);
      
      // Generate JWT token for Google user
      const { token, expiresAt } = signJwtToken({
        userId: googleUser.googleId, // Use Google ID as userId
      });
      
      return res.status(HTTPSTATUS.OK).json({
        message: "Google authentication successful",
        user: googleUser,
        accessToken: token,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });
    } catch (error) {
      console.error('Code exchange error:', error);
      throw new HttpException("Failed to exchange authorization code", HTTPSTATUS.UNAUTHORIZED);
    }
  }
);
