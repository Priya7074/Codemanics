import { useState, useEffect } from 'react'
import { assessmentApi, isDemoMode } from '../services/api'
import { CalendarDays, TrendingUp, AlertCircle, CheckCircle2, Loader2, Sparkles, ArrowRight } from 'lucide-react'
import { Card, RiskBadge } from './UI'
import type { Assessment, Recommendation, AssessmentTrend, RiskAnalysis } from '../types'

export function useAssessmentHistory(sessionId: string | undefined) {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadHistory = async () => {
    if (!sessionId) return

    setLoading(true)
    setError(null)
    try {
      const response = await assessmentApi.getAssessmentsBySession(sessionId)
      if (response.success && response.data) {
        setAssessments(response.data)
      } else {
        setError(response.error || 'Failed to load assessment history')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assessment history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [sessionId])

  return { assessments, loading, error, refetch: loadHistory }
}

export function useAssessmentTrend(sessionId: string | undefined) {
  const [trends, setTrends] = useState<AssessmentTrend[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTrends = async () => {
    if (!sessionId) return

    setLoading(true)
    setError(null)
    try {
      const response = await assessmentApi.getAssessmentTrend(sessionId)
      if (response.success && response.data) {
        setTrends(response.data)
      } else {
        setError(response.error || 'Failed to load assessment trends')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assessment trends')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrends()
  }, [sessionId])

  return { trends, loading, error, refetch: loadTrends }
}

export function useRecommendations(assessmentId: string | undefined) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRecommendations = async () => {
    if (!assessmentId) return

    setLoading(true)
    setError(null)
    try {
      const response = await assessmentApi.getRecommendations(assessmentId)
      if (response.success && response.data) {
        setRecommendations(response.data)
      } else {
        setError(response.error || 'Failed to load recommendations')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecommendations()
  }, [assessmentId])

  return { recommendations, loading, error, refetch: loadRecommendations }
}

export function useRiskAnalysis(assessmentId: string | undefined) {
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRiskAnalysis = async () => {
    if (!assessmentId) return

    setLoading(true)
    setError(null)
    try {
      const response = await assessmentApi.getRiskAnalysis(assessmentId)
      if (response.success && response.data) {
        setRiskAnalysis(response.data)
      } else {
        setError(response.error || 'Failed to load risk analysis')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load risk analysis')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRiskAnalysis()
  }, [assessmentId])

  return { riskAnalysis, loading, error, refetch: loadRiskAnalysis }
}

// UI Components for displaying assessment data
export function AssessmentHistory({ assessments, loading, error }: { assessments: Assessment[], loading: boolean, error: string | null }) {
  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 size={32} className="spinner" />
        <p>Loading assessment history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-message">
        <AlertCircle size={14} />
        {error}
      </div>
    )
  }

  if (assessments.length === 0) {
    return (
      <Card>
        <div className="empty-state">
          <CheckCircle2 size={32} />
          <p>No assessments yet</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="assessment-history">
      {isDemoMode() && (
        <div className="demo-notice">
          <Sparkles size={14} /> Demo mode - showing mock data
        </div>
      )}
      {assessments.map((assessment) => (
        <Card key={assessment._id} className="assessment-item">
          <div className="assessment-header">
            <span className="assessment-type">{assessment.type === 'text' ? 'Text' : 'Audio'}</span>
            <span className="assessment-date">
              <CalendarDays size={14} />
              {new Date(assessment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="assessment-body">
            <RiskBadge risk={assessment.riskLevel} />
            <div className="svi-score">
              <span>SVI:</span>
              <b>{assessment.sviScore}/100</b>
            </div>
          </div>
          {assessment.requiresHumanReview && (
            <div className="review-flag">
              <AlertCircle size={14} />
              Human review required
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

export function AssessmentTrendChart({ trends, loading, error }: { trends: AssessmentTrend[], loading: boolean, error: string | null }) {
  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 size={32} className="spinner" />
        <p>Loading trend data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-message">
        <AlertCircle size={14} />
        {error}
      </div>
    )
  }

  if (trends.length === 0) {
    return (
      <Card>
        <div className="empty-state">
          <TrendingUp size={32} />
          <p>No trend data available</p>
        </div>
      </Card>
    )
  }

  const maxSVI = Math.max(...trends.map(t => t.sviScore))

  return (
    <Card className="trend-card">
      <div className="card-heading">
        <h3>SVI Trend Over Time</h3>
        {isDemoMode() && (
          <div className="demo-notice compact">
            <Sparkles size={12} /> Demo mode
          </div>
        )}
      </div>
      <div className="trend-chart">
        <div className="chart-bars">
          {trends.map((trend, index) => (
            <div key={trend.assessmentId} className="chart-bar-group">
              <div
                className="chart-bar"
                style={{
                  height: `${(trend.sviScore / maxSVI) * 100}%`,
                  backgroundColor: getRiskColor(trend.riskLevel)
                }}
              />
              <span className="chart-label">
                {new Date(trend.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

function getRiskColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'low': return '#22b78a'
    case 'moderate': return '#f59e0b'
    case 'high': return '#ed4c91'
    case 'critical': return '#ef476f'
    default: return '#5b36e8'
  }
}

export function RecommendationList({ recommendations, loading, error }: { recommendations: Recommendation[], loading: boolean, error: string | null }) {
  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 size={32} className="spinner" />
        <p>Loading recommendations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-message">
        <AlertCircle size={14} />
        {error}
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <div className="empty-state">
          <CheckCircle2 size={32} />
          <p>No recommendations available</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="recommendation-list">
      {isDemoMode() && (
        <div className="demo-notice">
          <Sparkles size={14} /> Demo mode - showing mock data
        </div>
      )}
      {recommendations.map((rec) => (
        <Card key={rec._id} className="recommendation-item">
          <div className="recommendation-header">
            <span className={`priority priority-${rec.priority}`}>{rec.priority}</span>
            <span className="category">{rec.category}</span>
          </div>
          <h4>{rec.title}</h4>
          <p>{rec.description}</p>
          {rec.actionableSteps.length > 0 && (
            <div className="actionable-steps">
              <h5>Recommended steps:</h5>
              <ul>
                {rec.actionableSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="recommendation-footer">
            <span className={`status status-${rec.status}`}>{rec.status}</span>
            <ArrowRight size={16} />
          </div>
        </Card>
      ))}
    </div>
  )
}

export function RiskAnalysisDisplay({ riskAnalysis, loading, error }: { riskAnalysis: RiskAnalysis | null, loading: boolean, error: string | null }) {
  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 size={32} className="spinner" />
        <p>Loading risk analysis...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-message">
        <AlertCircle size={14} />
        {error}
      </div>
    )
  }

  if (!riskAnalysis) {
    return (
      <Card>
        <div className="empty-state">
          <AlertCircle size={32} />
          <p>No risk analysis available</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="risk-analysis-card">
      {isDemoMode() && (
        <div className="demo-notice">
          <Sparkles size={14} /> Demo mode - showing mock data
        </div>
      )}
      <div className="risk-analysis-header">
        <RiskBadge risk={riskAnalysis.riskLevel} />
        <div className="svi-score-large">
          <span>SVI Score:</span>
          <b>{riskAnalysis.sviScore}/100</b>
        </div>
      </div>

      <div className="confidence-level">
        <span>Confidence:</span>
        <b>{Math.round(riskAnalysis.confidence * 100)}%</b>
      </div>

      {riskAnalysis.safetyEscalation && (
        <div className="safety-escalation">
          <AlertCircle size={16} />
          <span>Safety escalation recommended</span>
        </div>
      )}

      <div className="contributing-indicators">
        <h4>Contributing Indicators</h4>
        {riskAnalysis.contributingIndicators.map((indicator, index) => (
          <div key={index} className="indicator-item">
            <div className="indicator-label">
              <span>{indicator.label}</span>
              <b>{indicator.value}%</b>
            </div>
            <div className="indicator-track">
              <div
                className={`indicator-bar indicator-${indicator.severity}`}
                style={{ width: `${indicator.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {riskAnalysis.requiresHumanReview && (
        <div className="human-review-notice">
          <CheckCircle2 size={16} />
          <span>Human review recommended for this assessment</span>
        </div>
      )}
    </Card>
  )
}