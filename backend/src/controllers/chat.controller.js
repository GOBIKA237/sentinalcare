const chatService = require("../services/chat.service");
const auditService = require("../services/audit.service");

async function startSession(req, res, next) {
  try {
    const session = await chatService.startSession(req.user.id);
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}

/**
 * Ownership of :id is checked here, not via requireSelfOrRole, since the
 * route param is a session id, not a user id. No role bypasses this check —
 * chat message content is owner-only, full stop, unlike checkins where
 * welfare_officer/admin can read the numeric (non-note) fields directly.
 */
async function sendMessage(req, res, next) {
  try {
    const { id: sessionId } = req.params;
    const { content, end } = req.body;

    if (typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({ error: "content is required" });
    }

    const session = await chatService.getSessionOwner(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Chat session not found" });
    }
    if (session.user_id !== req.user.id) {
      await auditService.record({
        actorUserId: req.user.id,
        targetUserId: session.user_id,
        action: "chat.messages.write",
        resourceId: sessionId,
        allowed: false,
        metadata: { reason: "not session owner" },
      });
      return res.status(403).json({ error: "Not authorized to access this chat session" });
    }

    const userMessage = await chatService.addMessage({ sessionId, role: "user", content });

    // Placeholder assistant reply so the conversation flow is demo-able
    // end to end; swap for a real LLM call when that service exists.
    const assistantReply = "Thanks for sharing that. Tell me more about how you're doing.";
    const assistantMessage = await chatService.addMessage({
      sessionId,
      role: "assistant",
      content: assistantReply,
    });

    let endedSession = null;
    if (end) {
      endedSession = await chatService.endSessionAndScore(sessionId);
    }

    res.status(201).json({
      userMessage: { ...userMessage, content },
      assistantMessage: { ...assistantMessage, content: assistantReply },
      session: endedSession,
    });
  } catch (err) {
    next(err);
  }
}

async function getMySessionMessages(req, res, next) {
  try {
    const { id: sessionId } = req.params;
    const session = await chatService.getSessionOwner(sessionId);
    if (!session || session.user_id !== req.user.id) {
      return res.status(404).json({ error: "Chat session not found" });
    }
    const messages = await chatService.getSessionMessages(sessionId);
    res.json({ session, messages });
  } catch (err) {
    next(err);
  }
}

/**
 * Derived-sentiment-only history. welfare_officer/admin reach this via
 * requireSelfOrRole in routes/chat.routes.js; it never touches message
 * content (see chatService.getSentimentHistory).
 */
async function getUserSentimentHistory(req, res, next) {
  try {
    const { userId } = req.params;
    const history = await chatService.getSentimentHistory(userId);

    if (req.user.id !== userId) {
      await auditService.record({
        actorUserId: req.user.id,
        targetUserId: userId,
        action: "chat.sentiment.read",
        allowed: true,
      });
    }

    res.json({ history });
  } catch (err) {
    next(err);
  }
}

module.exports = { startSession, sendMessage, getMySessionMessages, getUserSentimentHistory };
