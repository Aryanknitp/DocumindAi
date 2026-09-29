import User from "../models/User.js";

export const getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "preferences profile",
    );
    return res.status(200).json({
      success: true,
      preferences: user?.preferences || {
        theme: "dark",
        notifications: {},
        general: {},
        privacy: {},
      },
      profile: user?.profile || {
        bio: "",
        occupation: "",
        company: "",
        location: "",
        website: "",
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { preferences = {}, profile = {} } = req.body || {};

    user.preferences = {
      ...(user.preferences.toObject
        ? user.preferences.toObject()
        : user.preferences),
      ...preferences,
    };

    user.profile = {
      ...(user.profile.toObject ? user.profile.toObject() : user.profile),
      ...profile,
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      preferences: user.preferences,
      profile: user.profile,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
