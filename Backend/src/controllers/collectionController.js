import Collection from "../models/Collection.js";

export const listCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ userId: req.user._id })
      .populate("documentIds", "title fileType status")
      .sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, collections });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCollection = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Collection name is required" });
    const collection = await Collection.create({
      userId: req.user._id,
      name,
      description: req.body.description || "",
    });
    return res.status(201).json({ success: true, collection });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addDocumentToCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!collection)
      return res
        .status(404)
        .json({ success: false, message: "Collection not found" });
    if (
      !collection.documentIds.some(
        (id) => id.toString() === req.body.documentId,
      )
    )
      collection.documentIds.push(req.body.documentId);
    await collection.save();
    return res.status(200).json({ success: true, collection });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
