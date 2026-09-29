import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";

// Genereate Token 
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "documind_secret", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const createMailer = () => {
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465,
    requireTLS: smtpPort === 587,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
};

    // old verification message
// const issueVerificationCode = async (user) => {
//   const code = crypto.randomInt(100000, 1000000).toString();
//   user.emailVerificationToken = crypto
//     .createHash("sha256")
//     .update(code)
//     .digest("hex");
//   user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
//   await user.save({ validateBeforeSave: false });
//   await createMailer().sendMail({
//     from: process.env.EMAIL_FROM || process.env.SMTP_USER,
//     to: user.email,
//     subject: "Verify your Documind Ai email",
//     text: `Your verification code is ${code}. It expires in 10 minutes.`,
//     html: `<p>Your verification code is:</p><h2>${code}</h2><p>This code expires in 10 minutes.</p>`,
//   });
// };
     // newverfication of code for email verification 
const issueVerificationCode = async (user) => {
  const code = crypto.randomInt(100000, 1000000).toString();
  user.emailVerificationToken = crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");
  user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  // Standardized beautiful HTML layout preserving your exact text structure
  const beautifulHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your Documind Ai email</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04); overflow: hidden; border: 1px solid #e2e8f0; padding: 32px;">
              <tr>
                <td>
                  <!-- Logo / Header Accent -->
                  <div style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 24px; letter-spacing: -0.5px;">
                    DocuMind <span style="color: #3b82f6;">Ai</span>
                  </div>
                  
                  <!-- Exact original text, stylized professionally -->
                  <p style="margin: 0 0 12px 0; color: #475569; font-size: 15px; font-weight: 500;">Your verification code is:</p>
                  
                  <h2 style="margin: 0 0 24px 0; color: #0f172a; font-size: 32px; font-weight: 700; letter-spacing: 4px; font-family: SFMono-Regular, Menlo, Monaco, Consolas, monospace; background-color: #f1f5f9; padding: 14px 20px; border-radius: 8px; display: inline-block; border: 1px solid #e2e8f0;">${code}</h2>
                  
                  <p style="margin: 0; color: #64748b; font-size: 14px; border-top: 1px solid #f1f5f9; padding-top: 16px;">This code expires in 10 minutes.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await createMailer().sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: user.email,
    subject: "Verify your Documind Ai email",
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
    html: beautifulHtml,
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    try {
      await issueVerificationCode(user);
    } catch (emailError) {
      console.error(
        "Verification email failed:",
        emailError.code || emailError.message,
      );
      await User.deleteOne({ _id: user._id });
      return res
        .status(503)
        .json({ success: false, message: "Unable to send verification email" });
    }

    return res.status(201).json({
      success: true,
      message: "Verification code sent to your email",
      requiresVerification: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        emailVerified: false,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before signing in",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const requestPasswordReset = async (req, res) => {
  const genericResponse = {
    success: true,
    message: "If an account exists for that email, a reset link has been sent.",
  };

  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) return res.status(200).json(genericResponse);

    const user = await User.findOne({ email }).select(
      "+resetPasswordToken +resetPasswordExpires",
    );
    if (!user) return res.status(200).json(genericResponse);

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      requireTLS: smtpPort === 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    // Standarize the reset mail
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: "Reset your Documind Ai password",
      text: `Reset your Documind Ai password by copying and pasting this link into your browser (valid for 10 mins): ${resetUrl}`,
      html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset your Documind Ai password</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f9fafb; padding: 40px 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { padding: 32px 32px 20px 32px; text-align: center; }
        .logo { font-size: 24px; font-weight: 700; color: #111827; text-decoration: none; }
        .content { padding: 0 32px 32px 32px; color: #374151; font-size: 16px; line-height: 1.6; }
        h1 { font-size: 20px; font-weight: 600; color: #111827; margin-top: 0; margin-bottom: 16px; }
        p { margin-top: 0; margin-bottom: 24px; color: #4b5563; }
        .btn-container { margin-bottom: 24px; text-align: center; }
        .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 500; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-size: 16px; }
        .footer { background-color: #f3f4f6; padding: 24px 32px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; }
        .fallback-link { font-size: 13px; color: #9ca3af; word-break: break-all; margin-top: 16px; }
        .fallback-link a { color: #2563eb; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <!-- Header/Logo Area -->
          <div class="header">
            <a href="#" class="logo">Documind Ai</a>
          </div>
          
          <!-- Main Content -->
          <div class="content">
            <h1>Password Reset Request</h1>
            <p>Hello,</p>
            <p>We received a request to reset the password for your Documind Ai account. Click the button below to proceed.</p>
            
            <!-- CTA Button -->
            <div class="btn-container">
              <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
            </div>
            
            <p>This link is secure and will expire in <strong>10 mins</strong>. If you did not request this change, you can safely ignore this email.</p>
            
            <!-- Fallback URL for older email clients -->
            <div class="fallback-link">
              If the button doesn't work, copy and paste this URL into your browser:<br>
              <a href="${resetUrl}">${resetUrl}</a>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p style="margin: 0 0 8px 0;">&copy; ${new Date().getFullYear()} Documind Ai. All rights reserved.</p>
            <p style="margin: 0;">You are receiving this automated email because a password reset was requested for your account.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,
    });

    // await transporter.sendMail({
    //   from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    //   to: user.email,
    //   subject: "Reset your Documind Ai password",
    //   text: `Reset your password using this link (valid for 10 mins): ${resetUrl}`,
    //   html: `<p>Reset your Documind Ai password using the link below.</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in 10 mins.</p>`,
    // });

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error("Password reset email failed:", error.code || error.message);
    return res.status(503).json({
      success: false,
      message: "Unable to send reset email. Check the SMTP configuration.",
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const code = req.body.code?.trim();
    if (!email || !/^\d{6}$/.test(code || "")) {
      return res.status(400).json({
        success: false,
        message: "Email and a valid 6-digit code are required",
      });
    }
    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");
    const user = await User.findOne({
      email,
      emailVerificationToken: hashedCode,
      emailVerificationExpires: { $gt: new Date() },
    }).select("+emailVerificationToken +emailVerificationExpires");
    if (!user)
      return res.status(400).json({
        success: false,
        message: "Verification code is invalid or expired",
      });

    user.emailVerified = true;
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        onboardingCompleted: user.onboardingCompleted,
        emailVerified: true,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resendVerificationCode = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const user = await User.findOne({ email }).select(
      "+emailVerificationToken +emailVerificationExpires",
    );
    if (!user || user.emailVerified)
      return res.status(200).json({
        success: true,
        message: "If verification is required, a new code has been sent",
      });
    await issueVerificationCode(user);
    return res.status(200).json({
      success: true,
      message: "A new verification code has been sent",
    });
  } catch (error) {
    return res
      .status(503)
      .json({ success: false, message: "Unable to send verification email" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "A valid token and password of at least 8 characters are required",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Reset link is invalid or expired" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, bio, occupation, company, location, website, theme } =
      req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (name) user.name = name;
    if (bio !== undefined) user.profile.bio = bio;
    if (occupation !== undefined) user.profile.occupation = occupation;
    if (company !== undefined) user.profile.company = company;
    if (location !== undefined) user.profile.location = location;
    if (website !== undefined) user.profile.website = website;
    if (theme) user.preferences.theme = theme;

    await user.save();

    return res.status(200).json({
      success: true,
      user: { ...user.toObject(), password: undefined },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and a new password of at least 6 characters are required",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
