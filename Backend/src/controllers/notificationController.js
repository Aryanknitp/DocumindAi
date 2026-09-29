import Activity from "../models/Activity.js";

export const listNotifications = async (req, res) => {
  try {
    const items = await Activity.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    const notifications = items.map((item) => ({
      id: item._id,
      title: item.title,
      message: item.description,
      time: new Date(item.createdAt).toLocaleString(),
      read: false,
    }));

    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationsRead = async (req, res) => {
  try {
    return res
      .status(200)
      .json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
