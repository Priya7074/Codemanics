import Joi from 'joi';

// Validation schemas
const schemas = {
  // Auth schemas
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().required(),
    role: Joi.string().valid('victim', 'counsellor', 'medical_professional', 'authorized_officer', 'admin').default('victim'),
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  
  // Session schemas
  createSession: Joi.object({
    userId: Joi.alternatives().try(Joi.string(), Joi.number().integer()).required(),
    metadata: Joi.object({
      ipAddress: Joi.string(),
      userAgent: Joi.string(),
      location: Joi.string(),
    }),
  }),
  
  // Consent schemas
  consent: Joi.object({
    sessionId: Joi.string().required(),
    consentType: Joi.string().valid('ai_assessment', 'data_processing', 'human_review').required(),
    consentGiven: Joi.boolean().required(),
    consentText: Joi.string().required(),
  }),
  
  // Assessment schemas
  textAssessment: Joi.object({
    sessionId: Joi.string().required(),
    text: Joi.string().min(10).max(10000).required(),
    language: Joi.string().default('en'),
  }),
  
  audioAssessment: Joi.object({
    sessionId: Joi.string().required(),
    audioFile: Joi.object().required(), // Will be validated by multer
    language: Joi.string().default('en'),
  }),
  
  // Referral schemas
  createReferral: Joi.object({
    sessionId: Joi.string().required(),
    assessmentId: Joi.string().required(),
    referralType: Joi.string().valid('counsellor', 'medical_professional', 'authorized_officer', 'ngo', 'legal_aid').required(),
    urgency: Joi.string().valid('routine', 'priority', 'urgent', 'emergency').default('routine'),
    reason: Joi.string().required(),
    notes: Joi.string(),
  }),
  
  // General schemas
  id: Joi.object({
    id: Joi.string().required(),
  }),
  
  sessionId: Joi.object({
    sessionId: Joi.string().required(),
  }),
  
  assessmentId: Joi.object({
    assessmentId: Joi.string().required(),
  }),
};

export const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return next();
    }
    
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        error: 'Validation Error',
        message: errors.join(', '),
      });
    }
    
    req.body = value;
    next();
  };
};

export const validateParams = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return next();
    }
    
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        error: 'Validation Error',
        message: errors.join(', '),
      });
    }
    
    req.params = value;
    next();
  };
};

export const validateQuery = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return next();
    }
    
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        error: 'Validation Error',
        message: errors.join(', '),
      });
    }
    
    req.query = value;
    next();
  };
};
