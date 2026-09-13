import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// PostgreSQL connection pool
let pool = null;
let connectionPromise = null;

export const connectDB = async () => {
  if (pool) {
    return true;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      // Check if demo mode is enabled
      if (process.env.DEMO_MODE === 'true') {
        console.log('Demo mode: Skipping PostgreSQL connection');
        return false;
      }

      if (!process.env.DATABASE_URL) {
        console.log('No DATABASE_URL provided, running without PostgreSQL');
        return false;
      }

      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Test the connection
      await pool.query('SELECT NOW()');
      console.log('PostgreSQL connected successfully');

      // Create tables if they don't exist
      await createTables();
      return true;
    } catch (error) {
      console.error('PostgreSQL connection failed:', error.message);
      pool = null;
      connectionPromise = null;
      return false;
    }
  })();

  return connectionPromise;
};

export const disconnectDB = async () => {
  try {
    if (pool) {
      await pool.end();
      console.log('PostgreSQL connection closed');
    }
    pool = null;
    connectionPromise = null;
  } catch (error) {
    console.error('Error closing PostgreSQL connection:', error);
    throw error;
  }
};

export const getPool = () => {
  if (pool) {
    return pool;
  }

  return {
    query: async (...args) => {
      const connected = await connectDB();
      if (!connected || !pool) {
        throw new Error('PostgreSQL is not connected. Please configure DATABASE_URL and start PostgreSQL.');
      }
      return pool.query(...args);
    },
    end: async () => {
      if (pool) {
        await pool.end();
      }
    },
  };
};

// Create database tables
async function createTables() {
  if (!pool) return;

  const createTablesSQL = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'victim',
      name VARCHAR(255) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      two_factor_enabled BOOLEAN DEFAULT false,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Sessions table
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(255) UNIQUE NOT NULL,
      user_id INTEGER REFERENCES users(id),
      status VARCHAR(50) DEFAULT 'active',
      consent_given BOOLEAN DEFAULT false,
      consent_timestamp TIMESTAMP,
      start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      end_time TIMESTAMP,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Chat messages table (conversation memory)
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(255) NOT NULL,
      user_id INTEGER REFERENCES users(id),
      role VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      assessment_id VARCHAR(255),
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      metadata JSONB
    );

    -- Assessments table
    CREATE TABLE IF NOT EXISTS assessments (
      id SERIAL PRIMARY KEY,
      assessment_id VARCHAR(255) UNIQUE NOT NULL,
      session_id VARCHAR(255) NOT NULL,
      user_id INTEGER REFERENCES users(id),
      assessment_type VARCHAR(50) NOT NULL,
      indicators JSONB NOT NULL,
      svi_score INTEGER NOT NULL CHECK (svi_score >= 0 AND svi_score <= 100),
      risk_level VARCHAR(50) NOT NULL,
      confidence INTEGER DEFAULT 75 CHECK (confidence >= 0 AND confidence <= 100),
      safety_escalation_flag BOOLEAN DEFAULT false,
      escalation_reason TEXT,
      contributing_indicators JSONB,
      ai_provider VARCHAR(50) DEFAULT 'demo',
      model_version VARCHAR(255),
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      metadata JSONB,
      human_review_required BOOLEAN DEFAULT false,
      human_review_completed BOOLEAN DEFAULT false,
      reviewed_by INTEGER REFERENCES users(id),
      review_timestamp TIMESTAMP,
      review_notes TEXT
    );

    -- Consent records table
    CREATE TABLE IF NOT EXISTS consent_records (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(255) NOT NULL,
      user_id INTEGER REFERENCES users(id),
      consent_type VARCHAR(100) NOT NULL,
      consent_given BOOLEAN NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      metadata JSONB
    );

    -- Referrals table
    CREATE TABLE IF NOT EXISTS referrals (
      id SERIAL PRIMARY KEY,
      referral_id VARCHAR(255) UNIQUE NOT NULL,
      session_id VARCHAR(255) NOT NULL,
      assessment_id VARCHAR(255),
      user_id INTEGER REFERENCES users(id),
      professional_name VARCHAR(255) NOT NULL,
      professional_type VARCHAR(100) NOT NULL,
      contact_info VARCHAR(255) NOT NULL,
      reason TEXT NOT NULL,
      urgency VARCHAR(50) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      metadata JSONB
    );

    -- Support recommendations table
    CREATE TABLE IF NOT EXISTS support_recommendations (
      id SERIAL PRIMARY KEY,
      recommendation_id VARCHAR(255) UNIQUE NOT NULL,
      assessment_id VARCHAR(255) NOT NULL,
      session_id VARCHAR(255) NOT NULL,
      user_id INTEGER REFERENCES users(id),
      recommendation_type VARCHAR(100) NOT NULL,
      priority VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      action_items JSONB,
      based_on TEXT,
      service_type VARCHAR(100),
      service_name VARCHAR(255),
      service_contact VARCHAR(255),
      status VARCHAR(50) DEFAULT 'pending',
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Assessment trends table
    CREATE TABLE IF NOT EXISTS assessment_trends (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      session_id VARCHAR(255) NOT NULL,
      baseline_svi INTEGER NOT NULL,
      current_svi INTEGER NOT NULL,
      trend_direction VARCHAR(50) DEFAULT 'stable',
      trend_percentage DECIMAL(5,2),
      assessment_count INTEGER DEFAULT 1,
      first_assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      risk_level_history JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Audit logs table
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      session_id VARCHAR(255),
      action VARCHAR(100) NOT NULL,
      resource_type VARCHAR(100),
      resource_id VARCHAR(255),
      method VARCHAR(10),
      endpoint TEXT,
      status_code INTEGER,
      ip_address VARCHAR(45),
      user_agent TEXT,
      response_time INTEGER,
      success BOOLEAN DEFAULT true,
      error_message TEXT,
      details JSONB,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_assessments_session_id ON assessments(session_id);
    CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
    CREATE INDEX IF NOT EXISTS idx_assessments_svi_score ON assessments(svi_score);
    CREATE INDEX IF NOT EXISTS idx_assessments_risk_level ON assessments(risk_level);
    CREATE INDEX IF NOT EXISTS idx_consent_records_session_id ON consent_records(session_id);
    CREATE INDEX IF NOT EXISTS idx_referrals_session_id ON referrals(session_id);
    CREATE INDEX IF NOT EXISTS idx_support_recommendations_assessment_id ON support_recommendations(assessment_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
  `;

  try {
    await pool.query(createTablesSQL);
    console.log('Database tables created/verified successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

export default getPool;

