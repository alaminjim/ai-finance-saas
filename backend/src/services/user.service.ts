/// <reference types="multer" />
import UserModel from "../models/user.model";
import { NotFoundException } from "../utils/app-error";
import { UpdateUserType } from "../validators/user.validator";

export const findByIdUserService = async (userId: string) => {
  // Try to find by MongoDB ObjectId first
  let user = await UserModel.findById(userId);
  
  // If not found, try to find by Google ID
  if (!user) {
    user = await UserModel.findOne({ googleId: userId });
  }
  
  return user?.omitPassword();
};

export const findOrCreateGoogleUser = async (googleUser: {
  email: string;
  name: string;
  picture: string;
  googleId: string;
}) => {
  let user = await UserModel.findOne({ googleId: googleUser.googleId });
  
  if (!user) {
    // Check if user exists with same email
    user = await UserModel.findOne({ email: googleUser.email });
    
    if (user) {
      // Link Google account to existing user
      user.googleId = googleUser.googleId;
      if (!user.profilePicture && googleUser.picture) {
        user.profilePicture = googleUser.picture;
      }
      await user.save();
    } else {
      // Create new user
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
      
      user = await UserModel.create({
        name: googleUser.name,
        email: googleUser.email,
        profilePicture: googleUser.picture,
        googleId: googleUser.googleId,
        trialStart: now,
        trialEnd: trialEnd,
      });
    }
  }
  
  return user.omitPassword();
};

export const updateUserService = async (
  userId: string,
  body: UpdateUserType,
  profilePic?: Express.Multer.File
) => {
  console.log("Updating user service:", { userId, body, hasProfilePic: !!profilePic });

  try {
    // Try to find by MongoDB ObjectId first
    let user = await UserModel.findById(userId);
    
    // If not found, try to find by Google ID
    if (!user) {
      user = await UserModel.findOne({ googleId: userId });
    }
    
    if (!user) throw new NotFoundException("User not found");

    console.log("Found user:", user._id);

    if (profilePic) {
      console.log("Updating profile picture:", profilePic.path);
      user.profilePicture = profilePic.path;
    }

    if (body.name) {
      console.log("Updating name to:", body.name);
      user.set({
        name: body.name,
      });
    }

    await user.save();
    console.log("User saved successfully");

    return user.omitPassword();
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};
