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
    const { token } = req.body;

    if (!token) {
      throw new HttpException("Google token is required", HTTPSTATUS.BAD_REQUEST);
    }

    const googleUser = await googleAuthService.verifyGoogleToken(token);
    
    // Here you would implement the logic to find or create user in your database
    // and return appropriate tokens
    // For now, returning the Google user data
    return res.status(HTTPSTATUS.OK).json({
      message: "Google authentication successful",
      user: googleUser,
    });
  }
);
