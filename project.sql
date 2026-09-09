-- TraumoLink SIH PS 26093
-- Risk-to-Action + SVI + tamper-resistant data layer
-- PostgreSQL 18
-- Run this AFTER the existing TraumoLink V3 schema.sql.
--
-- This is a backward-compatible enhancement/migration. It does not replace
-- the existing schema and does not delete existing data.

BEGIN;

-- ============================================================
-- 1. SVI / Risk Assessment
-- ============================================================

ALTER TABLE ai_assessments
  ADD COLUMN IF NOT EXISTS svi_score NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS assessment_source VARCHAR(30) NOT NULL DEFAULT 'TEXT',
  ADD COLUMN IF NOT EXISTS adaptive_question_mode VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
  ADD COLUMN IF NOT EXISTS explainability JSONB NOT NULL DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ai_assessments_svi_score_check'
  ) THEN
    ALTER TABLE ai_assessments
      ADD CONSTRAINT ai_assessments_svi_score_check
      CHECK (svi_score IS NULL OR svi_score BETWEEN 0 AND 100);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS assessment_signals (
  id BIGSERIAL PRIMARY KEY,
  assessment_id BIGINT NOT NULL REFERENCES ai_assessments(id) ON DELETE RESTRICT,
  signal_type VARCHAR(60) NOT NULL,
  signal_value NUMERIC(10,4),
  signal_label VARCHAR(180),
  source VARCHAR(30) NOT NULL DEFAULT 'TEXT',
  confidence NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 100)
);

CREATE TABLE IF NOT EXISTS assessment_responses (
  id BIGSERIAL PRIMARY KEY,
  assessment_id BIGINT NOT NULL REFERENCES ai_assessments(id) ON DELETE RESTRICT,
  question_key VARCHAR(100) NOT NULL,
  response_value TEXT,
  response_type VARCHAR(30) NOT NULL DEFAULT 'TEXT',
  language VARCHAR(30),
  asked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assessment_signals_assessment
  ON assessment_signals(assessment_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_assessment_responses_assessment
  ON assessment_responses(assessment_id, asked_at DESC);

-- ============================================================
-- 2. Risk -> Action Engine
-- ============================================================

CREATE TABLE IF NOT EXISTS risk_action_rules (
  id BIGSERIAL PRIMARY KEY,
  risk_level VARCHAR(20) UNIQUE NOT NULL
    CHECK (risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  min_svi NUMERIC(5,2) NOT NULL,
  max_svi NUMERIC(5,2) NOT NULL,
  question_mode VARCHAR(30) NOT NULL
    CHECK (question_mode IN ('NORMAL','LIMITED','FEW','MINIMUM')),
  human_review_required BOOLEAN NOT NULL DEFAULT FALSE,
  immediate_action_required BOOLEAN NOT NULL DEFAULT FALSE,
  recommended_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (min_svi BETWEEN 0 AND 100),
  CHECK (max_svi BETWEEN 0 AND 100),
  CHECK (min_svi <= max_svi)
);

INSERT INTO risk_action_rules
(risk_level,min_svi,max_svi,question_mode,human_review_required,immediate_action_required,recommended_actions)
VALUES
('LOW',0,24.99,'NORMAL',false,false,
 '["Continue normal conversation","Provide relevant support information","Schedule follow-up if required"]'),
('MEDIUM',25,49.99,'LIMITED',false,false,
 '["Ask limited safety questions","Schedule a follow-up interaction","Notify assigned case worker","Monitor risk on next interaction"]'),
('HIGH',50,74.99,'FEW',true,false,
 '["Transfer to authorized human review","Review prior incidents","Check permitted evidence metadata","Create safety follow-up","Prioritize case in officer dashboard"]'),
('CRITICAL',75,100,'MINIMUM',true,true,
 '["Trigger immediate authorized human review","Notify designated responder","Prioritize the case","Create safety follow-up","Record delivery acknowledgement"]')
ON CONFLICT (risk_level) DO UPDATE SET
  min_svi=EXCLUDED.min_svi,
  max_svi=EXCLUDED.max_svi,
  question_mode=EXCLUDED.question_mode,
  human_review_required=EXCLUDED.human_review_required,
  immediate_action_required=EXCLUDED.immediate_action_required,
  recommended_actions=EXCLUDED.recommended_actions,
  updated_at=now();

CREATE TABLE IF NOT EXISTS risk_actions (
  id BIGSERIAL PRIMARY KEY,
  case_id BIGINT NOT NULL REFERENCES cases(id) ON DELETE RESTRICT,
  assessment_id BIGINT REFERENCES ai_assessments(id) ON DELETE RESTRICT,
  rule_id BIGINT REFERENCES risk_action_rules(id) ON DELETE RESTRICT,
  risk_level VARCHAR(20) NOT NULL
    CHECK (risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  action_type VARCHAR(80) NOT NULL,
  action_status VARCHAR(30) NOT NULL DEFAULT 'RECOMMENDED'
    CHECK (action_status IN ('RECOMMENDED','ASSIGNED','ACKNOWLEDGED','COMPLETED','CANCELLED')),
  reason TEXT,
  assigned_to BIGINT REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_risk_actions_case
  ON risk_actions(case_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_risk_actions_status
  ON risk_actions(action_status, risk_level);

-- ============================================================
-- 3. Voice / Text / History provenance
-- ============================================================

CREATE TABLE IF NOT EXISTS assessment_sources (
  id BIGSERIAL PRIMARY KEY,
  assessment_id BIGINT NOT NULL REFERENCES ai_assessments(id) ON DELETE RESTRICT,
  source_type VARCHAR(20) NOT NULL
    CHECK (source_type IN ('VOICE','TEXT','HISTORY','EVIDENCE')),
  source_ref VARCHAR(200),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assessment_sources_assessment
  ON assessment_sources(assessment_id, captured_at DESC);

-- ============================================================
-- 4. Evidence integrity / soft deletion
-- ============================================================

ALTER TABLE evidence
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by BIGINT REFERENCES users(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS deletion_reason VARCHAR(500),
  ADD COLUMN IF NOT EXISTS integrity_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_evidence_case_active
  ON evidence(case_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- ============================================================
-- 5. Case soft-delete instead of destructive delete
-- ============================================================

ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by BIGINT REFERENCES users(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS deletion_reason VARCHAR(500);

CREATE INDEX IF NOT EXISTS idx_cases_active
  ON cases(status, priority, created_at DESC)
  WHERE deleted_at IS NULL;

-- ============================================================
-- 6. Tamper-evident audit trail
-- ============================================================

ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS previous_hash TEXT,
  ADD COLUMN IF NOT EXISTS event_hash TEXT,
  ADD COLUMN IF NOT EXISTS immutable BOOLEAN NOT NULL DEFAULT TRUE;

CREATE OR REPLACE FUNCTION prevent_audit_delete()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Audit records are immutable and cannot be deleted';
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_no_delete ON audit_logs;
CREATE TRIGGER trg_audit_no_delete
BEFORE DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_delete();

CREATE OR REPLACE FUNCTION prevent_case_history_delete()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Case history is immutable; use status/soft-delete workflow';
END;
$$;

DROP TRIGGER IF EXISTS trg_case_updates_no_delete ON case_updates;
CREATE TRIGGER trg_case_updates_no_delete
BEFORE DELETE ON case_updates
FOR EACH ROW EXECUTE FUNCTION prevent_case_history_delete();

DROP TRIGGER IF EXISTS trg_ai_assessments_no_delete ON ai_assessments;
CREATE TRIGGER trg_ai_assessments_no_delete
BEFORE DELETE ON ai_assessments
FOR EACH ROW EXECUTE FUNCTION prevent_case_history_delete();

DROP TRIGGER IF EXISTS trg_evidence_no_delete ON evidence;
CREATE TRIGGER trg_evidence_no_delete
BEFORE DELETE ON evidence
FOR EACH ROW EXECUTE FUNCTION prevent_case_history_delete();

-- ============================================================
-- 7. Deletion governance
-- ============================================================

CREATE TABLE IF NOT EXISTS deletion_approvals (
  id BIGSERIAL PRIMARY KEY,
  request_id BIGINT NOT NULL REFERENCES data_deletion_requests(id) ON DELETE RESTRICT,
  reviewer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  decision VARCHAR(20) NOT NULL
    CHECK (decision IN ('APPROVED','REJECTED')),
  reason VARCHAR(1000) NOT NULL,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deletion_requests_case
  ON data_deletion_requests(case_id, requested_at DESC);

-- ============================================================
-- 8. Resolution verification: resolved != actually helped
-- ============================================================

ALTER TABLE resolutions
  ADD COLUMN IF NOT EXISTS client_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS client_outcome VARCHAR(40),
  ADD COLUMN IF NOT EXISTS verification_note TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by BIGINT REFERENCES users(id) ON DELETE RESTRICT;

-- ============================================================
-- 9. Data retention / access policy metadata
-- ============================================================

CREATE TABLE IF NOT EXISTS data_retention_policies (
  id BIGSERIAL PRIMARY KEY,
  data_type VARCHAR(80) UNIQUE NOT NULL,
  retention_days INT,
  legal_hold_allowed BOOLEAN NOT NULL DEFAULT TRUE,
  soft_delete_only BOOLEAN NOT NULL DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO data_retention_policies
(data_type,retention_days,legal_hold_allowed,soft_delete_only)
VALUES
('CASE',NULL,true,true),
('EVIDENCE',NULL,true,true),
('CONVERSATION',NULL,true,true),
('ASSESSMENT',NULL,true,true),
('AUDIT_LOG',NULL,true,true)
ON CONFLICT(data_type) DO NOTHING;

-- ============================================================
-- 10. Risk/action indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_ai_assessments_case_svi
  ON ai_assessments(case_id, svi_score DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_assessments_risk
  ON ai_assessments(risk_level, created_at DESC);

COMMIT;

-- IMPORTANT:
-- This database layer prevents ordinary destructive DELETEs on critical
-- records and supports audited/approved soft deletion. Real security also
-- requires PostgreSQL role permissions, backend authorization, encrypted
-- storage, backups, and legal retention policies.
