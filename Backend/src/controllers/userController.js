import User from "../models/User.js";
import Document from "../models/Document.js";
import Summary from "../models/Summary.js";
import ChatSession from "../models/ChatSession.js";
import Activity from "../models/Activity.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserOverview = async (req, res) => {
  try {
    const [documents, summaries, chats, recentActivity, user] =
      await Promise.all([
        Document.find({ userId: req.user._id, deletedAt: null })
          .sort({ createdAt: -1 })
          .limit(5),
        Summary.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(5),
        ChatSession.find({ userId: req.user._id })
          .sort({ updatedAt: -1 })
          .limit(5),
        Activity.find({ userId: req.user._id })
          .sort({ createdAt: -1 })
          .limit(10),
        User.findById(req.user._id).select("-password"),
      ]);

    return res.status(200).json({
      success: true,
      overview: {
        user,
        recentDocuments: documents,
        recentSummaries: summaries,
        recentChats: chats,
        recentActivity,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getStorageStats = async (req, res) => {
  try {
    const [usage, documentCount] = await Promise.all([
      Document.aggregate([
        { $match: { userId: req.user._id, deletedAt: null } },
        { $group: { _id: null, bytes: { $sum: "$size" } } },
      ]),
      Document.countDocuments({ userId: req.user._id, deletedAt: null }),
    ]);

    return res.status(200).json({
      success: true,
      storage: { bytes: usage[0]?.bytes || 0, documentCount },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
