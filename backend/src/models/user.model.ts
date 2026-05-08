import mongoose, { Document, Schema } from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypt";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  profilePicture: string | null;
  isPremium: boolean;
  stripeCustomerId?: string;
  trialStart?: Date;
  trialEnd?: Date;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
  omitPassword: () => Omit<UserDocument, "password">;
  isOnTrial: () => boolean;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    stripeCustomerId: {
      type: String,
      sparse: true,
    },
    trialStart: {
      type: Date,
      sparse: true,
    },
    trialEnd: {
      type: Date,
      sparse: true,
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    password: {
      type: String,
      select: true,
      required: function(this: UserDocument) {
        // Password is required unless user has googleId (Google auth user)
        return !this.googleId;
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (this: UserDocument, next) {
  if (this.isModified("password")) {
    if (this.password) {
      this.password = await hashValue(this.password);
    }
  }
  next();
});

userSchema.methods.omitPassword = function (this: UserDocument): Omit<UserDocument, "password"> {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.methods.comparePassword = async function (
  this: UserDocument,
  password: string
) {
  return compareValue(password, this.password);
};

userSchema.methods.isOnTrial = function (this: UserDocument): boolean {
  if (!this.trialStart || !this.trialEnd) {
    return false;
  }
  const now = new Date();
  return now >= this.trialStart && now <= this.trialEnd;
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);
export default UserModel;
