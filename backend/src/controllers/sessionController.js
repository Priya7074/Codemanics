import { getPool } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const createSession = async (req, res) => {
  try {
    const pool = getPool();
    const { userId, metadata } = req.body;
    
    const sessionId = uuidv4();
    
    const query = `
      INSERT INTO sessions (session_id, user_id, status, metadata)
      VALUES ($1, $2, 'active', $3)
      RETURNING id, session_id, user_id, status, created_at
    `;

    const values = [
      sessionId,
      userId || null,
      JSON.stringify({
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        ...metadata,
      })
    ];

    const result = await pool.query(query, values);
    
    res.status(201).json({
      message: 'Session created successfully',
      session: {
        sessionId: result.rows[0].session_id,
        userId: result.rows[0].user_id,
        status: result.rows[0].status,
        startTime: result.rows[0].created_at,
      },
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      error: 'Session creation failed',
      message: error.message,
    });
  }
};

export const getSession = async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    
    const query = `
      SELECT * FROM sessions
      WHERE session_id = $1
    `;

    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'The requested session does not exist',
      });
    }

    const session = result.rows[0];
    
    res.json({
      session: {
        sessionId: session.session_id,
        userId: session.user_id,
        status: session.status,
        consentGiven: session.consent_given,
        consentTimestamp: session.consent_timestamp,
        startTime: session.start_time,
        endTime: session.end_time,
        metadata: session.metadata,
      },
    });
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({
      error: 'Failed to retrieve session',
      message: error.message,
    });
  }
};

export const updateSession = async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const updates = req.body;
    
    const allowedFields = ['status', 'consent_given', 'consent_timestamp', 'end_time', 'metadata'];
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        const dbField = field === 'consent_given' ? 'consent_given' : 
                        field === 'consent_timestamp' ? 'consent_timestamp' :
                        field === 'end_time' ? 'end_time' :
                        field === 'metadata' ? 'metadata' : field;
        
        updateFields.push(`${dbField} = $${paramCount}`);
        updateValues.push(field === 'metadata' ? JSON.stringify(updates[field]) : updates[field]);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'No valid fields to update',
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    const query = `
      UPDATE sessions
      SET ${updateFields.join(', ')}
      WHERE session_id = $${paramCount}
      RETURNING session_id, status, updated_at
    `;

    const result = await pool.query(query, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'The requested session does not exist',
      });
    }

    res.json({
      message: 'Session updated successfully',
      session: {
        sessionId: result.rows[0].session_id,
        status: result.rows[0].status,
      },
    });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({
      error: 'Failed to update session',
      message: error.message,
    });
  }
};

export const endSession = async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    
    const query = `
      UPDATE sessions
      SET status = 'completed',
          end_time = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE session_id = $1
      RETURNING session_id, status, end_time
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'The requested session does not exist',
      });
    }

    res.json({
      message: 'Session ended successfully',
      session: {
        sessionId: result.rows[0].session_id,
        status: result.rows[0].status,
        endTime: result.rows[0].end_time,
      },
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      error: 'Failed to end session',
      message: error.message,
    });
  }
};
