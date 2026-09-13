import { useState, useEffect } from 'react'
import { referralApi, isDemoMode } from '../services/api'
import { Users, Phone, Mail, CalendarDays, AlertCircle, CheckCircle2, Loader2, Sparkles, Plus, ArrowRight } from 'lucide-react'
import { Card, Button } from './UI'
import type { Referral, ReferralRequest } from '../services/api'

export function useReferrals(sessionId: string | undefined) {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadReferrals = async () => {
    if (!sessionId) return

    setLoading(true)
    setError(null)
    try {
      const response = await referralApi.getReferralsBySession(sessionId)
      if (response.success && response.data) {
        setReferrals(response.data)
      } else {
        setError(response.error || 'Failed to load referrals')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load referrals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReferrals()
  }, [sessionId])

  return { referrals, loading, error, refetch: loadReferrals }
}

export function useReferralCreation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createReferral = async (data: ReferralRequest) => {
    setLoading(true)
    setError(null)
    try {
      const response = await referralApi.createReferral(data)
      if (response.success && response.data) {
        return response.data
      } else {
        setError(response.error || 'Failed to create referral')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create referral')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createReferral, loading, error }
}

export function ReferralList({ referrals, loading, error, onCreateReferral }: { referrals: Referral[], loading: boolean, error: string | null, onCreateReferral?: () => void }) {
  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 size={32} className="spinner" />
        <p>Loading referrals...</p>
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

  if (referrals.length === 0) {
    return (
      <Card>
        <div className="empty-state">
          <Users size={32} />
          <p>No referrals yet</p>
          {onCreateReferral && (
            <Button onClick={onCreateReferral}>
              <Plus size={16} /> Create Referral
            </Button>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className="referral-list">
      {isDemoMode() && (
        <div className="demo-notice">
          <Sparkles size={14} /> Demo mode - showing mock data
        </div>
      )}
      {referrals.map((referral) => (
        <Card key={referral._id} className="referral-item">
          <div className="referral-header">
            <div className="referral-professional">
              <Users size={18} />
              <div>
                <h4>{referral.professionalName}</h4>
                <span className="professional-type">{referral.professionalType}</span>
              </div>
            </div>
            <span className={`urgency urgency-${referral.urgency}`}>{referral.urgency}</span>
          </div>

          <div className="referral-contact">
            <div className="contact-item">
              <Mail size={14} />
              <span>{referral.contactInfo}</span>
            </div>
          </div>

          <div className="referral-reason">
            <span className="reason-label">Reason:</span>
            <p>{referral.reason}</p>
          </div>

          <div className="referral-footer">
            <div className="referral-dates">
              <span className="date-item">
                <CalendarDays size={12} />
                Created: {new Date(referral.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="referral-status">
              <span className={`status status-${referral.status}`}>{referral.status}</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export function ReferralForm({ onSubmit, onCancel, sessionId, assessmentId }: { onSubmit: (data: ReferralRequest) => void, onCancel: () => void, sessionId: string, assessmentId: string }) {
  const [formData, setFormData] = useState({
    professionalName: '',
    professionalType: 'Counsellor',
    contactInfo: '',
    reason: '',
    urgency: 'medium' as const
  })
  const [loading, setLoading] = useState(false)
  const { createReferral, error } = useReferralCreation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const referralData: ReferralRequest = {
      sessionId,
      assessmentId,
      ...formData
    }

    const result = await createReferral(referralData)
    if (result) {
      onSubmit(result)
    }

    setLoading(false)
  }

  return (
    <Card className="referral-form-card">
      <div className="referral-form-header">
        <h3>Create Referral</h3>
        {isDemoMode() && (
          <div className="demo-notice compact">
            <Sparkles size={12} /> Demo mode
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>Professional Name *</span>
            <input
              type="text"
              required
              value={formData.professionalName}
              onChange={(e) => setFormData({ ...formData, professionalName: e.target.value })}
              placeholder="Enter professional name"
            />
          </label>

          <label className="field">
            <span>Professional Type *</span>
            <select
              required
              value={formData.professionalType}
              onChange={(e) => setFormData({ ...formData, professionalType: e.target.value })}
            >
              <option value="Counsellor">Counsellor</option>
              <option value="Psychologist">Psychologist</option>
              <option value="Social Worker">Social Worker</option>
              <option value="Medical Professional">Medical Professional</option>
              <option value="Legal Advisor">Legal Advisor</option>
              <option value="NGO Representative">NGO Representative</option>
            </select>
          </label>

          <label className="field field-full">
            <span>Contact Information *</span>
            <input
              type="text"
              required
              value={formData.contactInfo}
              onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
              placeholder="Email or phone number"
            />
          </label>

          <label className="field field-full">
            <span>Reason for Referral *</span>
            <textarea
              required
              rows={4}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Explain why this referral is needed"
            />
          </label>

          <label className="field">
            <span>Urgency Level *</span>
            <select
              required
              value={formData.urgency}
              onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div className="form-actions">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 size={16} className="spinner" /> : 'Create Referral'}
          </Button>
        </div>
      </form>
    </Card>
  )
}