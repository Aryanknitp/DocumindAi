import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
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
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
      sparse: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    githubId: {
      type: String,
      sparse: true,
      unique: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    consent: {
      essential: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
      analytics: { type: Boolean, default: false },
      preferences: { type: Boolean, default: false },
      consentUpdatedAt: { type: Date },
    },
    scheduledForDeletion: { type: Boolean, default: false },
    deletionScheduledAt: { type: Date },
    deletionDate: { type: Date },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    profile: {
      bio: { type: String, default: "" },
      occupation: { type: String, default: "" },
      company: { type: String, default: "" },
      location: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    preferences: {
      theme: { type: String, default: "dark" },
      notifications: {
        emailSummary: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: false },
        weeklyDigest: { type: Boolean, default: true },
        uploadComplete: { type: Boolean, default: true },
        shareNotifications: { type: Boolean, default: false },
      },
      general: {
        autoProcess: { type: Boolean, default: true },
        chatHistory: { type: Boolean, default: true },
        tips: { type: Boolean, default: false },
      },
      privacy: {
        analytics: { type: Boolean, default: false },
        crashReports: { type: Boolean, default: true },
        improveAI: { type: Boolean, default: false },
      },
    },
    lastLoginAt: { type: Date },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  {
    timestamps: true,
  },
);

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password || "");
};

const User = mongoose.model("User", userSchema);

export default User;
