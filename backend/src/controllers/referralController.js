import { getPool } from '../config/database.js';
import { generateReferralId } from '../utils/idGenerator.js';

const mapReferralRow = (row) => ({
  referralId: row.referral_id,
  sessionId: row.session_id,
  assessmentId: row.assessment_id,
  referralType: row.professional_type,
  urgency: row.urgency,
  reason: row.reason,
  notes: row.metadata?.notes ?? null,
  referredToName: row.professional_name,
  referredToContact: row.contact_info,
  status: row.status,
  outcome: row.metadata?.outcome ?? null,
  followUpRequired: row.metadata?.followUpRequired ?? false,
  followUpDate: row.metadata?.followUpDate ?? null,
  createdAt: row.created_at,
  acceptedAt: row.metadata?.acceptedAt ?? null,
  completedAt: row.metadata?.completedAt ?? null,
});

export const createReferral = async (req, res) => {
  try {
    const pool = getPool();
    const { sessionId, assessmentId, referralType, urgency, reason, notes } = req.body;
    const userId = req.user?.id ?? req.user?._id;

    const assessmentResult = await pool.query(
      'SELECT assessment_id, user_id, svi_score, risk_level, safety_escalation_flag FROM assessments WHERE assessment_id = $1',
      [assessmentId]
    );

    if (assessmentResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Assessment not found',
        message: 'The specified assessment does not exist',
      });
    }

    const assessment = assessmentResult.rows[0];
    if (assessment.user_id !== userId && !['authorized_officer', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to create a referral for this assessment',
      });
    }

    const referralId = generateReferralId();
    const metadata = {
      notes,
      sviScore: assessment.svi_score,
      riskLevel: assessment.risk_level,
      safetyEscalationFlag: assessment.safety_escalation_flag,
      referralType,
    };

    const result = await pool.query(
      `INSERT INTO referrals (
        referral_id, session_id, assessment_id, user_id,
        professional_name, professional_type, contact_info,
        reason, urgency, status, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        referralId,
        sessionId,
        assessmentId,
        userId,
        req.user.name,
        referralType,
        '',
        reason,
        urgency || 'routine',
        JSON.stringify(metadata),
      ]
    );

    res.status(201).json({
      message: 'Referral created successfully',
      referral: mapReferralRow(result.rows[0]),
    });
  } catch (error) {
    console.error('Error creating referral:', error);
    res.status(500).json({
      error: 'Referral creation failed',
      message: error.message,
    });
  }
};

export const getReferralsBySession = async (req, res) => {
  try {
    const pool = getPool();
    const { sessionId } = req.params;

    const result = await pool.query(
      `SELECT *
       FROM referrals
       WHERE session_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [sessionId]
    );

    if (result.rows.length > 0 &&
        result.rows[0].user_id !== (req.user?.id ?? req.user?._id) &&
        !['authorized_officer', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to view these referrals',
      });
    }

    res.json({
      referrals: result.rows.map((row) => mapReferralRow(row)),
    });
  } catch (error) {
    console.error('Error getting referrals by session:', error);
    res.status(500).json({
      error: 'Failed to retrieve referrals',
      message: error.message,
    });
  }
};

export const getReferral = async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM referrals WHERE referral_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Referral not found',
        message: 'The requested referral does not exist',
      });
    }

    const referral = mapReferralRow(result.rows[0]);

    if (referral.assessmentId && result.rows[0].user_id !== (req.user?.id ?? req.user?._id) &&
        !['authorized_officer', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to view this referral',
      });
    }

    res.json({
      referral,
    });
  } catch (error) {
    console.error('Error getting referral:', error);
    res.status(500).json({
      error: 'Failed to retrieve referral',
      message: error.message,
    });
  }
};

export const updateReferral = async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const updates = req.body;

    const existingResult = await pool.query(
      'SELECT * FROM referrals WHERE referral_id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Referral not found',
        message: 'The requested referral does not exist',
      });
    }

    const existingReferral = existingResult.rows[0];

    if (existingReferral.user_id !== (req.user?.id ?? req.user?._id) &&
        !['authorized_officer', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to update this referral',
      });
    }

    const nextMetadata = { ...(existingReferral.metadata || {}), ...updates.metadata };
    if (updates.reason) nextMetadata.reason = updates.reason;
    if (updates.notes !== undefined) nextMetadata.notes = updates.notes;
    if (updates.outcome !== undefined) nextMetadata.outcome = updates.outcome;
    if (updates.followUpRequired !== undefined) nextMetadata.followUpRequired = updates.followUpRequired;
    if (updates.followUpDate !== undefined) nextMetadata.followUpDate = updates.followUpDate;

    const result = await pool.query(
      `UPDATE referrals
       SET reason = COALESCE($1, reason),
           urgency = COALESCE($2, urgency),
           status = COALESCE($3, status),
           metadata = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE referral_id = $5
       RETURNING *`,
      [updates.reason ?? null, updates.urgency ?? null, updates.status ?? null, JSON.stringify(nextMetadata), id]
    );

    res.json({
      message: 'Referral updated successfully',
      referral: mapReferralRow(result.rows[0]),
    });
  } catch (error) {
    console.error('Error updating referral:', error);
    res.status(500).json({
      error: 'Failed to update referral',
      message: error.message,
    });
  }
};

export const acceptReferral = async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;

    const existingResult = await pool.query(
      'SELECT * FROM referrals WHERE referral_id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Referral not found',
        message: 'The requested referral does not exist',
      });
    }

    const current = existingResult.rows[0];
    const metadata = { ...(current.metadata || {}), referredToName: req.user.name, acceptedAt: new Date().toISOString() };

    const result = await pool.query(
      `UPDATE referrals
       SET status = 'accepted',
           professional_name = $1,
           metadata = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE referral_id = $3
       RETURNING *`,
      [req.user.name, JSON.stringify(metadata), id]
    );

    res.json({
      message: 'Referral accepted successfully',
      referral: mapReferralRow(result.rows[0]),
    });
  } catch (error) {
    console.error('Error accepting referral:', error);
    res.status(500).json({
      error: 'Failed to accept referral',
      message: error.message,
    });
  }
};

export const completeReferral = async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { outcome } = req.body;

    const existingResult = await pool.query(
      'SELECT * FROM referrals WHERE referral_id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Referral not found',
        message: 'The requested referral does not exist',
      });
    }

    const metadata = { ...(existingResult.rows[0].metadata || {}), outcome, completedAt: new Date().toISOString() };

    const result = await pool.query(
      `UPDATE referrals
       SET status = 'completed',
           metadata = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE referral_id = $2
       RETURNING *`,
      [JSON.stringify(metadata), id]
    );

    res.json({
      message: 'Referral completed successfully',
      referral: mapReferralRow(result.rows[0]),
    });
  } catch (error) {
    console.error('Error completing referral:', error);
    res.status(500).json({
      error: 'Failed to complete referral',
      message: error.message,
    });
  }
};
