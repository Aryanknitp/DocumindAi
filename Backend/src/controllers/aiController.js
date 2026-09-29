import Document from "../models/Document.js";
import Summary from "../models/Summary.js";
import ChatSession from "../models/ChatSession.js";
import Activity from "../models/Activity.js";
import {
  generateInsightSummary,
  generateChatReply,
  searchWebSources,
} from "../services/aiService.js";
import { getDocumentText } from "../services/documentTextService.js";

const selectRelevantContext = (text, question, limit = 12000) => {
  const source = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (source.length <= limit) return source;

  const terms = (question.toLowerCase().match(/[a-z0-9]+/g) || []).filter(
    (term) => term.length > 3,
  );
  const sentences = source.split(/(?<=[.!?])\s+/).filter(Boolean);
  const ranked = sentences
    .map((sentence, index) => ({
      sentence,
      index,
      score: terms.reduce(
        (total, term) =>
          total + (sentence.toLowerCase().includes(term) ? 1 : 0),
        0,
      ),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const selected = [];
  let length = 0;
  for (const item of ranked) {
    if (!item.score && selected.length >= 4) break;
    if (length + item.sentence.length > limit) continue;
    selected.push(item);
    length += item.sentence.length + 1;
    if (length >= limit) break;
  }
  return selected
    .sort((a, b) => a.index - b.index)
    .map((item) => item.sentence)
    .join(" ");
};

export const generateSummary = async (req, res) => {
  try {
    const { documentId, mode = "medium" } = req.body;
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
    });

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    const content =
      (await getDocumentText(document)) ||
      "No extracted content available for analysis.";
    const summaryContent = await generateInsightSummary(content, mode);

    const summary = await Summary.findOneAndUpdate(
      { userId: req.user._id, documentId: document._id, mode },
      {
        userId: req.user._id,
        documentId: document._id,
        mode,
        content: summaryContent,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    document.summary = summaryContent;
    await document.save();

    await Activity.create({
      userId: req.user._id,
      type: "summary",
      title: "AI summary generated",
      description: `Summary created for ${document.originalName}`,
      metadata: { documentId: document._id, mode },
    });

    return res
      .status(200)
      .json({ success: true, summary: summaryContent, summaryRecord: summary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const chatWithDocument = async (req, res) => {
  try {
    const { documentId, message, sessionId } = req.body;

    if (!message || !message.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message is required" });
    }

    const document = documentId
      ? await Document.findOne({
          _id: documentId,
          userId: req.user._id,
          deletedAt: null,
        })
      : null;
    if (documentId && !document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    let session = null;
    if (sessionId) {
      session = await ChatSession.findOne({
        _id: sessionId,
        userId: req.user._id,
        ...(document ? { documentId: document._id } : {}),
      });
    }

    if (!session) {
      session = await ChatSession.create({
        userId: req.user._id,
        documentId: document ? document._id : null,
        title: document ? document.title : "New discussion",
      });
    }

    session.messages.push({ role: "user", content: message.trim() });

    const documentText = document ? await getDocumentText(document) : "";
    const context = document
      ? selectRelevantContext(documentText, message) ||
        "No document text available."
      : "General assistance.";
    let assistantReply = await generateChatReply(message, context);
    const questionWords = message.toLowerCase().match(/[a-z0-9]+/g) || [];
    const hasDocumentEvidence =r
      documentText &&
      questionWords.some(
        (word) => word.length > 3 && documentText.toLowerCase().includes(word),
      );
    if (document && !hasDocumentEvidence) {
      const sources = await searchWebSources(message);
      if (sources.length) {
        assistantReply += `\n\n## Web sources\n${sources.map((source) => `- [${source.title}](${source.url})`).join("\n")}`;
      } else {
        assistantReply +=
          "\n\nNo reliable web sources were found for this question.";
      }
    }

    session.messages.push({ role: "assistant", content: assistantReply });
    await session.save();

    await Activity.create({
      userId: req.user._id,
      type: "chat",
      title: "Chat interaction",
      description: "User asked a question about a document",
      metadata: {
        documentId: document ? document._id : null,
        sessionId: session._id,
      },
    });

    return res.status(200).json({
      success: true,
      message: assistantReply,
      session,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getChatSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user._id }).sort({
      updatedAt: -1,
    });
    return res.status(200).json({ success: true, sessions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteChatSession = async (req, res) => {
  try {
    const session = await ChatSession.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!session)
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    return res
      .status(200)
      .json({ success: true, message: "Conversation deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const [
      documentCount,
      summaryCount,
      chatCount,
      storageUsage,
      recentActivity,
    ] = await Promise.all([
      Document.countDocuments({ userId: req.user._id, deletedAt: null }),
      Summary.countDocuments({ userId: req.user._id }),
      ChatSession.countDocuments({ userId: req.user._id }),
      Document.aggregate([
        { $match: { userId: req.user._id, deletedAt: null } },
        { $group: { _id: null, bytes: { $sum: "$size" } } },
      ]),
      Activity.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(8),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalDocuments: documentCount,
        aiSummaries: summaryCount,
        chatSessions: chatCount,
        storageUsed: `${((storageUsage[0]?.bytes || 0) / (1024 * 1024)).toFixed(2)} MB`,
      },
      activity: recentActivity,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
