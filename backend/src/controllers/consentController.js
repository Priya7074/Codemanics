import { getPool } from '../config/database.js';

export const recordConsent = async (req, res) => {
  try {
    const pool = getPool();
    const { sessionId, consentType, consentGiven, userId } = req.body;

    const query = `
      INSERT INTO consent_records (session_id, user_id, consent_type, consent_given, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, session_id, consent_type, consent_given, timestamp
    `;

    const values = [
      sessionId,
      userId || null,
      consentType,
      consentGiven,
      JSON.stringify({ timestamp: new Date().toISOString() }),
    ];

    const result = await pool.query(query, values);

    // Update session consent status
    const updateSessionQuery = `
      UPDATE sessions
      SET consent_given = $1,
          consent_timestamp = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE session_id = $2
    `;

    await pool.query(updateSessionQuery, [consentGiven, sessionId]);

    res.status(201).json({
      message: 'Consent recorded successfully',
      consent: {
        id: result.rows[0].id,
        sessionId: result.rows[0].session_id,
        consentType: result.rows[0].consent_type,
        consentGiven: result.rows[0].consent_given,
        timestamp: result.rows[0].timestamp,
      },
    });
  } catch (error) {
    console.error('Error recording consent:', error);
    res.status(500).json({
      error: 'Failed to record consent',
      message: error.message,
    });
  }
};

export const getConsentBySession = async (req, res) => {
  try {
    const pool = getPool();
    const { sessionId } = req.params;

    const query = `
      SELECT * FROM consent_records
      WHERE session_id = $1
      ORDER BY timestamp DESC
    `;

    const result = await pool.query(query, [sessionId]);

    res.json({
      consentRecords: result.rows.map(record => ({
        id: record.id,
        sessionId: record.session_id,
        userId: record.user_id,
        consentType: record.consent_type,
        consentGiven: record.consent_given,
        timestamp: record.timestamp,
        metadata: record.metadata,
      })),
    });
  } catch (error) {
    console.error('Error getting consent records:', error);
    res.status(500).json({
      error: 'Failed to retrieve consent records',
      message: error.message,
    });
  }
};

export const createConsent = recordConsent;
export const getConsent = getConsentBySession;
