import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import { loginService, registerService } from "../services/auth.service";
import { googleAuthService } from "../services/googleAuth.service";
import { HttpException } from "../utils/app-error";

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
    const { code } = req.body;

    if (!code) {
      throw new HttpException("Authorization code is required", HTTPSTATUS.BAD_REQUEST);
    }

    // For now, we'll simulate the token exchange
    // In a real implementation, you would exchange the code for tokens using the OAuth2Client
    try {
      // Simulate successful authentication
      const mockGoogleUser = {
        email: "user@gmail.com",
        name: "Google User",
        picture: "https://lh3.googleusercontent.com/a/default-user",
        googleId: "123456789",
      };

      return res.status(HTTPSTATUS.OK).json({
        message: "Google authentication successful",
        user: mockGoogleUser,
        token: "mock-jwt-token", // In real implementation, this would be your JWT
      });
    } catch (error) {
      throw new HttpException("Failed to exchange authorization code", HTTPSTATUS.UNAUTHORIZED);
    }
  }
);
