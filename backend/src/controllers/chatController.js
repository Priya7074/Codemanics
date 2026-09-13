import { getPool } from '../config/database.js';
import aiChatService from '../services/aiChatService.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new chat session
 */
export const createChatSession = async (req, res) => {
  try {
    const pool = getPool();
    const { userId, metadata } = req.body;
    const sessionId = uuidv4();

    const query = `
      INSERT INTO sessions (session_id, user_id, status, metadata)
      VALUES ($1, $2, 'active', $3)
      RETURNING id, session_id, user_id, status, created_at
    `;

    const values = [sessionId, userId || null, JSON.stringify(metadata || {})];
    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      data: {
        sessionId: result.rows[0].session_id,
        userId: result.rows[0].user_id,
        status: result.rows[0].status,
        createdAt: result.rows[0].created_at,
      },
    });
  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create chat session',
      message: error.message,
    });
  }
};

/**
 * Send a chat message and get AI response
 */
export const sendMessage = async (req, res) => {
  try {
    const pool = getPool();
    const { sessionId, message, userId, metadata } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and message are required',
      });
    }

    // Store user message
    const userMessageQuery = `
      INSERT INTO chat_messages (session_id, user_id, role, content, metadata)
      VALUES ($1, $2, 'user', $3, $4)
      RETURNING id, timestamp
    `;

    const userMessageValues = [
      sessionId,
      userId || null,
      message,
      JSON.stringify(metadata || {}),
    ];

    await pool.query(userMessageQuery, userMessageValues);

    // Retrieve conversation history
    const historyQuery = `
      SELECT role, content, timestamp
      FROM chat_messages
      WHERE session_id = $1
      ORDER BY timestamp ASC
      LIMIT 20
    `;

    const historyResult = await pool.query(historyQuery, [sessionId]);
    const conversationHistory = historyResult.rows.map(row => ({
      role: row.role,
      content: row.content,
      timestamp: row.timestamp,
    }));

    // Get session context
    const sessionQuery = `
      SELECT s.*, c.consent_given
      FROM sessions s
      LEFT JOIN consent_records c ON s.session_id = c.session_id
      WHERE s.session_id = $1
    `;

    const sessionResult = await pool.query(sessionQuery, [sessionId]);
    const sessionContext = sessionResult.rows[0] || {};

    // Generate AI response
    const context = {
      sessionId: sessionId,
      userId: userId,
      hasConsent: sessionContext.consent_given || false,
      sessionStatus: sessionContext.status,
      conversationLength: conversationHistory.length,
    };

    const aiResponse = await aiChatService.generateResponse(
      message,
      conversationHistory,
      context
    );

    // Store AI response
    const aiMessageQuery = `
      INSERT INTO chat_messages (session_id, user_id, role, content, metadata)
      VALUES ($1, $2, 'assistant', $3, $4)
      RETURNING id, timestamp
    `;

    const aiMessageValues = [
      sessionId,
      userId || null,
      aiResponse.text,
      JSON.stringify({
        provider: aiResponse.provider,
        model: aiResponse.model,
        confidence: aiResponse.confidence,
        requiresAssessment: aiResponse.requiresAssessment,
        ...aiResponse.metadata,
      }),
    ];

    await pool.query(aiMessageQuery, aiMessageValues);

    res.status(200).json({
      success: true,
      data: {
        message: aiResponse.text,
        sessionId: sessionId,
        provider: aiResponse.provider,
        model: aiResponse.model,
        confidence: aiResponse.confidence,
        requiresAssessment: aiResponse.requiresAssessment,
        metadata: aiResponse.metadata,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message',
      message: error.message,
    });
  }
};

/**
 * Get conversation history for a session
 */
export const getConversationHistory = async (req, res) => {
  try {
    const pool = getPool();
    const { sessionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const query = `
      SELECT id, role, content, timestamp, metadata
      FROM chat_messages
      WHERE session_id = $1
      ORDER BY timestamp ASC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [sessionId, limit, offset]);

    res.status(200).json({
      success: true,
      data: {
        sessionId: sessionId,
        messages: result.rows.map(row => ({
          id: row.id,
          role: row.role,
          content: row.content,
          timestamp: row.timestamp,
          metadata: row.metadata,
        })),
        count: result.rows.length,
      },
    });
  } catch (error) {
    console.error('Error getting conversation history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversation history',
      message: error.message,
    });
  }
};

/**
 * Delete a chat session (for cleanup/privacy)
 */
export const deleteChatSession = async (req, res) => {
  try {
    const pool = getPool();
    const { sessionId } = req.params;

    // Delete chat messages first
    await pool.query('DELETE FROM chat_messages WHERE session_id = $1', [sessionId]);

    // Update session status
    const query = `
      UPDATE sessions
      SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
      WHERE session_id = $1
      RETURNING session_id
    `;

    const result = await pool.query(query, [sessionId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        sessionId: sessionId,
        message: 'Session deleted successfully',
      },
    });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete session',
      message: error.message,
    });
  }
};

/**
 * Get session info
 */
export const getSessionInfo = async (req, res) => {
  try {
    const pool = getPool();
    const { sessionId } = req.params;

    const query = `
      SELECT s.*, 
             COUNT(cm.id) as message_count,
             MAX(cm.timestamp) as last_message_time
      FROM sessions s
      LEFT JOIN chat_messages cm ON s.session_id = cm.session_id
      WHERE s.session_id = $1
      GROUP BY s.id
    `;

    const result = await pool.query(query, [sessionId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    const session = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.session_id,
        userId: session.user_id,
        status: session.status,
        consentGiven: session.consent_given,
        messageCount: parseInt(session.message_count),
        lastMessageTime: session.last_message_time,
        startTime: session.start_time,
        endTime: session.end_time,
        metadata: session.metadata,
        createdAt: session.created_at,
        updatedAt: session.updated_at,
      },
    });
  } catch (error) {
    console.error('Error getting session info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve session info',
      message: error.message,
    });
  }
};
