/// <reference types="multer" />
import UserModel from "../models/user.model";
import { NotFoundException } from "../utils/app-error";
import { UpdateUserType } from "../validators/user.validator";

export const findByIdUserService = async (userId: string) => {
  const user = await UserModel.findById(userId);
  return user?.omitPassword();
};

export const updateUserService = async (
  userId: string,
  body: UpdateUserType,
  profilePic?: Express.Multer.File
) => {
  console.log("Updating user service:", { userId, body, hasProfilePic: !!profilePic });

  try {
    const user = await UserModel.findById(userId);
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
