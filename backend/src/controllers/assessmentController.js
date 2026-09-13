import { getPool } from '../config/database.js';
import aiAnalysisService from '../services/aiAnalysisService.js';
import sviEngine from '../services/sviEngine.js';
import recommendationEngine from '../services/recommendationEngine.js';
import { v4 as uuidv4 } from 'uuid';

export const createTextAssessment = async (req, res) => {
  try {
    const { sessionId, text, language } = req.body;
    const isDemoMode = process.env.AI_PROVIDER === 'demo' && process.env.DEMO_MODE === 'true';
    const userId = req.user?.id || (isDemoMode ? 'demo-user' : null);
    
    // Verify user has consent for this session
    // (In production, this would check consent records)
    
    // Analyze text using AI service
    const startTime = Date.now();
    const indicators = await aiAnalysisService.analyzeText(text, language);
    const processingTime = Date.now() - startTime;
    
    // Calculate SVI score
    const sviResult = sviEngine.calculateSVI(indicators);
    
    // Generate recommendations
    const recommendations = recommendationEngine.generateRecommendations({
      sviScore: sviResult.sviScore,
      riskLevel: sviResult.riskLevel,
      indicators: indicators,
      safetyEscalationFlag: sviResult.safetyEscalationFlag,
    });
    
    const assessmentId = uuidv4();
    
    // In demo mode, skip database operations
    if (isDemoMode) {
      return res.status(201).json({
        message: 'Text assessment completed successfully (DEMO MODE)',
        assessment: {
          _id: assessmentId,
          assessmentId: assessmentId,
          sessionId: sessionId || 'demo-session',
          userId: userId,
          assessmentType: 'text',
          type: 'text',
          content: text,
          indicators: {
            sentiment: indicators.sentiment,
            emotionalState: indicators.emotionalState,
            distress: indicators.distress,
            fear: indicators.fear,
            anxiety: indicators.anxiety,
            trauma: indicators.trauma,
            threatVulnerability: indicators.threatVulnerability,
            socialIsolation: indicators.socialIsolation,
            emotionalIndicators: {
              sentiment: indicators.sentiment,
              distress: indicators.distress,
              fear: indicators.fear,
              anxiety: indicators.anxiety,
              anger: 0,
              sadness: indicators.distress,
              hope: 50 - indicators.distress,
            }
          },
          sviScore: sviResult.sviScore,
          riskLevel: sviResult.riskLevel,
          confidence: indicators.confidence,
          safetyEscalationFlag: sviResult.safetyEscalationFlag,
          safetyEscalation: sviResult.safetyEscalationFlag,
          escalationReason: sviResult.escalationReason,
          contributingIndicators: sviResult.contributingIndicators,
          aiProvider: indicators.provider,
          metadata: {
            processingTime,
            textLength: text.length,
          },
          humanReviewRequired: sviResult.riskLevel === 'High' || sviResult.riskLevel === 'Critical',
          requiresHumanReview: sviResult.riskLevel === 'High' || sviResult.riskLevel === 'Critical',
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        recommendations: recommendations.map(rec => ({
          recommendationType: rec.recommendationType,
          priority: rec.priority,
          title: rec.title,
          description: rec.description,
          actionItems: rec.actionItems,
          serviceType: rec.serviceType,
          serviceName: rec.serviceName,
          serviceContact: rec.serviceContact,
        })),
        data: {
          _id: uuidv4(),
          assessmentId: assessmentId,
          sessionId: sessionId || 'demo-session',
          type: 'text',
          content: text,
          emotionalIndicators: {
            sentiment: indicators.sentiment,
            distress: indicators.distress,
            fear: indicators.fear,
            anxiety: indicators.anxiety,
            anger: 0,
            sadness: indicators.distress,
            hope: 50 - indicators.distress,
          },
          sviScore: sviResult.sviScore,
          riskLevel: sviResult.riskLevel,
          safetyEscalation: sviResult.safetyEscalationFlag,
          recommendations: recommendations.map(rec => rec.title),
          createdAt: new Date().toISOString(),
          requiresHumanReview: sviResult.riskLevel === 'High' || sviResult.riskLevel === 'Critical',
        }
      });
    }
    
    // Create assessment record in PostgreSQL
    const assessmentQuery = `
      INSERT INTO assessments (
        assessment_id, session_id, user_id, assessment_type, indicators,
        svi_score, risk_level, confidence, safety_escalation_flag, escalation_reason,
        contributing_indicators, ai_provider, metadata, human_review_required
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, assessment_id, session_id, svi_score, risk_level, timestamp
    `;

    const assessmentValues = [
      assessmentId,
      sessionId || 'demo-session',
      userId,
      'text',
      JSON.stringify(indicators),
      sviResult.sviScore,
      sviResult.riskLevel,
      indicators.confidence,
      sviResult.safetyEscalationFlag,
      sviResult.escalationReason,
      JSON.stringify(sviResult.contributingIndicators),
      indicators.provider,
      JSON.stringify({ processingTime, textLength: text.length }),
      sviResult.riskLevel === 'High' || sviResult.riskLevel === 'Critical',
    ];

    const assessmentResult = await getPool().query(assessmentQuery, assessmentValues);
    
    // Save recommendations
    for (const rec of recommendations) {
      const recommendationId = uuidv4();
      const recommendationQuery = `
        INSERT INTO support_recommendations (
          recommendation_id, assessment_id, session_id, user_id,
          recommendation_type, priority, title, description, action_items,
          based_on, service_type, service_name, service_contact
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `;

      const recommendationValues = [
        recommendationId,
        assessmentId,
        sessionId || 'demo-session',
        userId,
        rec.recommendationType,
        rec.priority,
        rec.title,
        rec.description,
        JSON.stringify(rec.actionItems),
        rec.basedOn,
        rec.serviceType,
        rec.serviceName,
        rec.serviceContact,
      ];

      await getPool().query(recommendationQuery, recommendationValues);
    }
    
    // Update assessment trend
    await updateAssessmentTrend(userId, sessionId, sviResult.sviScore, sviResult.riskLevel);
    
    res.status(201).json({
      message: 'Text assessment completed successfully',
      assessment: {
        _id: assessmentId,
        assessmentId: assessmentId,
        sessionId: sessionId || 'demo-session',
        assessmentType: 'text',
        type: 'text',
        content: text,
        indicators: {
          sentiment: indicators.sentiment,
          emotionalState: indicators.emotionalState,
          distress: indicators.distress,
          fear: indicators.fear,
          anxiety: indicators.anxiety,
          trauma: indicators.trauma,
          threatVulnerability: indicators.threatVulnerability,
          socialIsolation: indicators.socialIsolation,
          emotionalIndicators: {
            sentiment: indicators.sentiment,
            distress: indicators.distress,
            fear: indicators.fear,
            anxiety: indicators.anxiety,
            anger: 0,
            sadness: indicators.distress,
            hope: 50 - indicators.distress,
          }
        },
        sviScore: sviResult.sviScore,
        riskLevel: sviResult.riskLevel,
        confidence: indicators.confidence,
        safetyEscalationFlag: sviResult.safetyEscalationFlag,
        safetyEscalation: sviResult.safetyEscalationFlag,
        escalationReason: sviResult.escalationReason,
        contributingIndicators: sviResult.contributingIndicators,
        aiProvider: indicators.provider,
        metadata: {
          processingTime,
          textLength: text.length,
        },
        humanReviewRequired: sviResult.riskLevel === 'High' || sviResult.riskLevel === 'Critical',
        requiresHumanReview: sviResult.riskLevel === 'High' || sviResult.riskLevel === 'Critical',
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      recommendations: recommendations.map(rec => ({
        recommendationType: rec.recommendationType,
        priority: rec.priority,
        title: rec.title,
        description: rec.description,
        actionItems: rec.actionItems,
        serviceType: rec.serviceType,
        serviceName: rec.serviceName,
        serviceContact: rec.serviceContact,
      })),
    });
  } catch (error) {
    console.error('Error creating text assessment:', error);
    res.status(500).json({
      error: 'Text assessment failed',
      message: error.message,
    });
  }
};

export const createAudioAssessment = async (req, res) => {
  const isDemoMode = process.env.AI_PROVIDER === 'demo' && process.env.DEMO_MODE === 'true';
  
  try {
    const { sessionId, language } = req.body;
    const userId = req.user?.id || (isDemoMode ? 'demo-user' : null);
    
    if (!req.file) {
      return res.status(400).json({
        error: 'No audio file provided',
        message: 'An audio file is required for audio assessment',
      });
    }
    
    // In demo mode, skip file validation and processing
    if (isDemoMode) {
      // Generate demo audio analysis
      const audioFeatures = await aiAnalysisService.analyzeAudio(null, language);
      
      // Calculate SVI score
      const sviResult = sviEngine.calculateSVI({
        sentiment: 30,
        emotionalState: audioFeatures.emotionalIntensity,
        distress: 70,
        fear: 50,
        anxiety: 80,
        trauma: 40,
        threatVulnerability: 50,
        socialIsolation: 40,
      });
      
      // Generate recommendations
      const recommendations = recommendationEngine.generateRecommendations({
        sviScore: sviResult.sviScore,
        riskLevel: sviResult.riskLevel,
        indicators: {
          sentiment: 30,
          emotionalState: audioFeatures.emotionalIntensity,
          distress: 70,
          fear: 50,
          anxiety: 80,
          trauma: 40,
          threatVulnerability: 50,
          socialIsolation: 40,
        },
        safetyEscalationFlag: sviResult.safetyEscalationFlag,
      });
      
      const assessmentId = uuidv4();
      return res.status(201).json({
        message: 'Audio assessment completed successfully (DEMO MODE)',
        assessment: {
          _id: assessmentId,
          assessmentId: assessmentId,
          sessionId: sessionId || 'demo-session',
          userId: userId,
          assessmentType: 'audio',
          type: 'audio',
          content: 'Demo audio assessment',
          indicators: {
            sentiment: 30,
            emotionalState: audioFeatures.emotionalIntensity,
            distress: 70,
            fear: 50,
            anxiety: 80,
            trauma: 40,
            threatVulnerability: 50,
            socialIsolation: 40,
            emotionalIndicators: {
              sentiment: 30,
              distress: 70,
              fear: 50,
              anxiety: 80,
              anger: 30,
              sadness: 60,
              hope: 30,
            }
          },
          sviScore: sviResult.sviScore,
          riskLevel: sviResult.riskLevel,
          confidence: audioFeatures.confidence,
          safetyEscalationFlag: sviResult.safetyEscalationFlag,
          safetyEscalation: sviResult.safetyEscalationFlag,
          escalationReason: sviResult.escalationReason,
          contributingIndicators: sviResult.contributingIndicators,
          aiProvider: audioFeatures.provider,
          metadata: {
            processingTime: 500,
            audioDuration: 0,
            textLength: 0,
            audioFeatures: {
              speechRate: audioFeatures.speechRate,
              pauses: audioFeatures.pauses,
              hesitation: audioFeatures.hesitation,
              pitchVariation: audioFeatures.pitchVariation,
              emotionalIntensity: audioFeatures.emotionalIntensity,
            },
          },
          humanReviewRequired: sviResult.riskLevel === 'High' || sviResult.riskLevel === 'Critical',
          requiresHumanReview: sviResult.riskLevel === 'High' || sviResult.riskLevel === 'Critical',
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        recommendations: recommendations.map(rec => ({
          recommendationType: rec.recommendationType,
          priority: rec.priority,
          title: rec.title,
          description: rec.description,
          actionItems: rec.actionItems,
          serviceType: rec.serviceType,
          serviceName: rec.serviceName,
          serviceContact: rec.serviceContact,
        })),
        data: {
          _id: uuidv4(),
          assessmentId: assessmentId,
          sessionId: sessionId || 'demo-session',
          type: 'audio',
          content: 'Demo audio assessment',
          emotionalIndicators: {
            sentiment: 30,
            distress: 70,
            fear: 50,
            anxiety: 80,
            anger: 30,
            sadness: 60,
            hope: 30,
          },
          sviScore: sviResult.sviScore,
          riskLevel: sviResult.riskLevel,
          safetyEscalation: sviResult.safetyEscalationFlag,
          recommendations: recommendations.map(rec => rec.title),
          createdAt: new Date().toISOString(),
          requiresHumanReview: sviResult.riskLevel === 'High' || sviResult.riskLevel === 'Critical',
        }
      });
    }
    
    // Analyze audio using AI service (simplified for now)
    const startTime = Date.now();
    const audioFeatures = await aiAnalysisService.analyzeAudio(null, language);
    const processingTime = Date.now() - startTime;
    
    // Combine audio and text indicators
    const combinedIndicators = {
      sentiment: 30,
      emotionalState: audioFeatures.emotionalIntensity,
      distress: 70,
      fear: 50,
      anxiety: 80,
      trauma: 40,
      threatVulnerability: 50,
      socialIsolation: 40,
    };
    
    // Calculate SVI score
    const sviResult = sviEngine.calculateSVI(combinedIndicators);
    
    // Generate recommendations
    const recommendations = recommendationEngine.generateRecommendations({
      sviScore: sviResult.sviScore,
      riskLevel: sviResult.riskLevel,
      indicators: combinedIndicators,
      safetyEscalationFlag: sviResult.safetyEscalationFlag,
    });
    
    const assessmentId = uuidv4();
    
    // Create assessment record in PostgreSQL
    const assessmentQuery = `
      INSERT INTO assessments (
        assessment_id, session_id, user_id, assessment_type, indicators,
        svi_score, risk_level, confidence, safety_escalation_flag, escalation_reason,
        contributing_indicators, ai_provider, metadata, human_review_required
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, assessment_id, session_id, svi_score, risk_level, timestamp
    `;

    const assessmentValues = [
      assessmentId,
      sessionId || 'demo-session',
      userId,
      'audio',
      JSON.stringify(combinedIndicators),
      sviResult.sviScore,
      sviResult.riskLevel,
      audioFeatures.confidence,
      sviResult.safetyEscalationFlag,
      sviResult.escalationReason,
      JSON.stringify(sviResult.contributingIndicators),
      audioFeatures.provider,
      JSON.stringify({ processingTime, audioDuration: 0, textLength: 0 }),
      sviResult.riskLevel === 'High' || sviResult.riskLevel === 'Critical',
    ];

    const assessmentResult = await getPool().query(assessmentQuery, assessmentValues);
    
    // Save recommendations
    for (const rec of recommendations) {
      const recommendationId = uuidv4();
      const recommendationQuery = `
        INSERT INTO support_recommendations (
          recommendation_id, assessment_id, session_id, user_id,
          recommendation_type, priority, title, description, action_items,
          based_on, service_type, service_name, service_contact
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `;

      const recommendationValues = [
        recommendationId,
        assessmentId,
        sessionId || 'demo-session',
        userId,
        rec.recommendationType,
        rec.priority,
        rec.title,
        rec.description,
        JSON.stringify(rec.actionItems),
        rec.basedOn,
        rec.serviceType,
        rec.serviceName,
        rec.serviceContact,
      ];

      await getPool().query(recommendationQuery, recommendationValues);
    }
    
    // Update assessment trend
    await updateAssessmentTrend(userId, sessionId, sviResult.sviScore, sviResult.riskLevel);
    
    res.status(201).json({
      message: 'Audio assessment completed successfully',
      assessment: {
        _id: assessmentId,
        assessmentId: assessmentId,
        sessionId: sessionId || 'demo-session',
        assessmentType: 'audio',
        type: 'audio',
        content: 'Audio assessment',
        indicators: combinedIndicators,
        sviScore: sviResult.sviScore,
        riskLevel: sviResult.riskLevel,
        confidence: audioFeatures.confidence,
        safetyEscalationFlag: sviResult.safetyEscalationFlag,
        safetyEscalation: sviResult.safetyEscalationFlag,
        escalationReason: sviResult.escalationReason,
        contributingIndicators: sviResult.contributingIndicators,
        aiProvider: audioFeatures.provider,
        metadata: {
          processingTime,
          audioDuration: 0,
          textLength: 0,
        },
        humanReviewRequired: sviResult.riskLevel === 'High' || sviResult.riskLevel === 'Critical',
        requiresHumanReview: sviResult.riskLevel === 'High' || sviResult.riskLevel === 'Critical',
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      recommendations: recommendations.map(rec => ({
        recommendationType: rec.recommendationType,
        priority: rec.priority,
        title: rec.title,
        description: rec.description,
        actionItems: rec.actionItems,
        serviceType: rec.serviceType,
        serviceName: rec.serviceName,
        serviceContact: rec.serviceContact,
      })),
    });
  } catch (error) {
    console.error('Error creating audio assessment:', error);
    res.status(500).json({
      error: 'Audio assessment failed',
      message: error.message,
    });
  }
};

export const getAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT * FROM assessments
      WHERE assessment_id = $1
    `;

    const result = await getPool().query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Assessment not found',
        message: 'The requested assessment does not exist',
      });
    }

    const assessment = result.rows[0];
    
    // Check if user has permission to view this assessment
    if (assessment.user_id !== req.user?.id && 
        !['authorized_officer', 'admin'].includes(req.user?.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to view this assessment',
      });
    }
    
    res.json({
      assessment: {
        assessmentId: assessment.assessment_id,
        sessionId: assessment.session_id,
        assessmentType: assessment.assessment_type,
        indicators: assessment.indicators,
        sviScore: assessment.svi_score,
        riskLevel: assessment.risk_level,
        confidence: assessment.confidence,
        safetyEscalationFlag: assessment.safety_escalation_flag,
        escalationReason: assessment.escalation_reason,
        contributingIndicators: assessment.contributing_indicators,
        humanReviewRequired: assessment.human_review_required,
        humanReviewCompleted: assessment.human_review_completed,
        timestamp: assessment.timestamp,
      },
    });
  } catch (error) {
    console.error('Error getting assessment:', error);
    res.status(500).json({
      error: 'Failed to retrieve assessment',
      message: error.message,
    });
  }
};

export const getAssessmentsBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const query = `
      SELECT * FROM assessments
      WHERE session_id = $1
      ORDER BY timestamp DESC
      LIMIT 50
    `;

    const result = await getPool().query(query, [sessionId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Assessment not found',
        message: 'No assessments found for this session',
      });
    }
    
    // Check if user has permission to view these assessments
    if (result.rows.length > 0 && 
        result.rows[0].user_id !== req.user?.id && 
        !['authorized_officer', 'admin'].includes(req.user?.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to view these assessments',
      });
    }
    
    res.json({
      assessments: result.rows.map(assessment => ({
        assessmentId: assessment.assessment_id,
        sessionId: assessment.session_id,
        assessmentType: assessment.assessment_type,
        sviScore: assessment.svi_score,
        riskLevel: assessment.risk_level,
        timestamp: assessment.timestamp,
      })),
    });
  } catch (error) {
    console.error('Error getting assessments by session:', error);
    res.status(500).json({
      error: 'Failed to retrieve assessments',
      message: error.message,
    });
  }
};

export const getAssessmentTrend = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const query = `
      SELECT * FROM assessment_trends
      WHERE session_id = $1
    `;

    const result = await getPool().query(query, [sessionId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Trend not found',
        message: 'No trend data available for this session',
      });
    }

    const trend = result.rows[0];
    
    // Check if user has permission to view this trend
    if (trend.user_id !== req.user?.id && 
        !['authorized_officer', 'admin'].includes(req.user?.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to view this trend',
      });
    }
    
    res.json({
      trend: {
        baselineSvi: trend.baseline_svi,
        currentSvi: trend.current_svi,
        trendDirection: trend.trend_direction,
        trendPercentage: trend.trend_percentage,
        assessmentCount: trend.assessment_count,
        firstAssessmentDate: trend.first_assessment_date,
        lastAssessmentDate: trend.last_assessment_date,
        riskLevelHistory: trend.risk_level_history,
      },
    });
  } catch (error) {
    console.error('Error getting assessment trend:', error);
    res.status(500).json({
      error: 'Failed to retrieve assessment trend',
      message: error.message,
    });
  }
};

export const getRiskByAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    
    const query = `
      SELECT * FROM assessments
      WHERE assessment_id = $1
    `;

    const result = await getPool().query(query, [assessmentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Assessment not found',
        message: 'The requested assessment does not exist',
      });
    }

    const assessment = result.rows[0];
    
    // Check if user has permission to view this assessment
    if (assessment.user_id !== req.user?.id && 
        !['authorized_officer', 'admin'].includes(req.user?.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to view this assessment',
      });
    }
    
    res.json({
      risk: {
        sviScore: assessment.svi_score,
        riskLevel: assessment.risk_level,
        confidence: assessment.confidence,
        safetyEscalationFlag: assessment.safety_escalation_flag,
        escalationReason: assessment.escalation_reason,
        contributingIndicators: assessment.contributing_indicators,
        humanReviewRequired: assessment.human_review_required,
      },
    });
  } catch (error) {
    console.error('Error getting risk by assessment:', error);
    res.status(500).json({
      error: 'Failed to retrieve risk information',
      message: error.message,
    });
  }
};

export const getRecommendationsByAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    
    const query = `
      SELECT * FROM support_recommendations
      WHERE assessment_id = $1
      ORDER BY timestamp DESC
    `;

    const result = await getPool().query(query, [assessmentId]);
    
    // Check if user has permission to view these recommendations
    if (result.rows.length > 0 && 
        result.rows[0].user_id !== req.user?.id && 
        !['authorized_officer', 'admin'].includes(req.user?.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to view these recommendations',
      });
    }
    
    res.json({
      recommendations: result.rows.map(rec => ({
        recommendationType: rec.recommendation_type,
        priority: rec.priority,
        title: rec.title,
        description: rec.description,
        actionItems: rec.action_items,
        status: rec.status,
        serviceType: rec.service_type,
        serviceName: rec.service_name,
        serviceContact: rec.service_contact,
        timestamp: rec.timestamp,
      })),
    });
  } catch (error) {
    console.error('Error getting recommendations by assessment:', error);
    res.status(500).json({
      error: 'Failed to retrieve recommendations',
      message: error.message,
    });
  }
};

// Helper function to update assessment trend
async function updateAssessmentTrend(userId, sessionId, sviScore, riskLevel) {
  try {
    // Check if trend exists for this session
    const trendQuery = `
      SELECT * FROM assessment_trends
      WHERE session_id = $1
    `;

    const trendResult = await getPool().query(trendQuery, [sessionId]);

    if (trendResult.rows.length === 0) {
      // Create new trend record
      const insertQuery = `
        INSERT INTO assessment_trends (
          user_id, session_id, baseline_svi, current_svi, trend_direction,
          trend_percentage, assessment_count, first_assessment_date, last_assessment_date,
          risk_level_history
        ) VALUES ($1, $2, $3, $4, 'stable', 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $5)
      `;

      const riskLevelHistory = JSON.stringify([{ riskLevel, timestamp: new Date() }]);
      await getPool().query(insertQuery, [userId, sessionId, sviScore, sviScore, riskLevelHistory]);
    } else {
      // Update existing trend
      const existingTrend = trendResult.rows[0];
      const previousSvi = existingTrend.current_svi;
      const newAssessmentCount = existingTrend.assessment_count + 1;

      // Calculate trend
      const trendAnalysis = sviEngine.calculateTrend(previousSvi, sviScore);

      // Get existing risk level history and add new entry
      const existingHistory = existingTrend.risk_level_history || [];
      const newHistory = [...existingHistory, { riskLevel, timestamp: new Date() }];
      
      // Keep only last 10 risk level entries
      const limitedHistory = newHistory.slice(-10);

      const updateQuery = `
        UPDATE assessment_trends
        SET current_svi = $1,
            trend_direction = $2,
            trend_percentage = $3,
            assessment_count = $4,
            last_assessment_date = CURRENT_TIMESTAMP,
            risk_level_history = $5,
            updated_at = CURRENT_TIMESTAMP
        WHERE session_id = $6
      `;

      await getPool().query(updateQuery, [
        sviScore,
        trendAnalysis.trendDirection,
        trendAnalysis.percentageChange,
        newAssessmentCount,
        JSON.stringify(limitedHistory),
        sessionId,
      ]);
    }
  } catch (error) {
    console.error('Error updating assessment trend:', error);
    // Don't throw error - this is a secondary operation
  }
}
