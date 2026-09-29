import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import GitHubStrategy from "passport-github2";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const GoogleOAuth2Strategy = GoogleStrategy.Strategy;
const GithubStrategy = GitHubStrategy.Strategy;
const isConfigured = (value) => value && !value.startsWith("your_");

if (
  isConfigured(process.env.GOOGLE_CLIENT_ID) &&
  isConfigured(process.env.GOOGLE_CLIENT_SECRET)
) {
  passport.use(
    new GoogleOAuth2Strategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          "http://localhost:5000/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) {
            return done(new Error("Google did not provide an email address"));
          }

          let user = await User.findOne({
            $or: [{ googleId: profile.id }, { email }],
          });

          if (user) {
            user.googleId = profile.id;
            user.profilePicture =
              profile.photos?.[0]?.value || user.profilePicture;
            user.authProvider = "google";
            user.emailVerified = true;
            user.lastLoginAt = new Date();
            await user.save();
            return done(null, user);
          }

          const newUser = new User({
            googleId: profile.id,
            name: profile.displayName,
            email,
            profilePicture: profile.photos?.[0]?.value,
            authProvider: "google",
            emailVerified: true,
            lastLoginAt: new Date(),
          });

          await newUser.save();
          return done(null, newUser);
        } catch (error) {
          return done(error, null);
        }
      },
    ),
  );
} else {
  console.warn(
    "Google OAuth is disabled because GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are not set.",
  );
}

if (
  isConfigured(process.env.GITHUB_CLIENT_ID) &&
  isConfigured(process.env.GITHUB_CLIENT_SECRET)
) {
  passport.use(
    new GithubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL:
          process.env.GITHUB_CALLBACK_URL ||
          "http://localhost:5000/api/auth/github/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) {
            return done(new Error("GitHub did not provide an email address"));
          }

          let user = await User.findOne({
            $or: [{ githubId: profile.id }, { email }],
          });

          if (user) {
            user.githubId = profile.id;
            user.profilePicture =
              profile.photos?.[0]?.value || user.profilePicture;
            user.authProvider = "github";
            user.emailVerified = true;
            user.lastLoginAt = new Date();
            await user.save();
            return done(null, user);
          }

          const newUser = new User({
            githubId: profile.id,
            name: profile.displayName || profile.username,
            email,
            profilePicture: profile.photos?.[0]?.value,
            authProvider: "github",
            emailVerified: true,
            lastLoginAt: new Date(),
          });

          await newUser.save();
          return done(null, newUser);
        } catch (error) {
          return done(error, null);
        }
      },
    ),
  );
} else {
  console.warn(
    "GitHub OAuth is disabled because GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are not set.",
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
