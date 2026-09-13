import { useState, useEffect } from 'react'
import { dashboardApi, isDemoMode } from '../services/api'
import { BriefcaseBusiness, AlertCircle, Users, CheckCircle2, TrendingUp, Loader2, Sparkles } from 'lucide-react'
import { Card } from './UI'

interface DashboardStats {
  label: string
  value: string
  change: string
  tone: string
  icon: React.ReactNode
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats[]>([
    { label: 'Total Cases', value: '124', change: '+12%', tone: 'purple', icon: <BriefcaseBusiness /> },
    { label: 'High Risk Cases', value: '18', change: '+5%', tone: 'pink', icon: <AlertCircle /> },
    { label: 'Active Users', value: '892', change: '+20%', tone: 'blue', icon: <Users /> },
    { label: 'Resolved Cases', value: '93', change: '+18%', tone: 'mint', icon: <CheckCircle2 /> }
  ])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await dashboardApi.getOverview()

        if (response.success && response.data) {
          const data = response.data
          setStats([
            { label: 'Total Cases', value: String(data.totalCases), change: `+${data.trends.cases}%`, tone: 'purple', icon: <BriefcaseBusiness /> },
            { label: 'High Risk Cases', value: String(data.highRiskCases), change: `+${data.trends.highRisk}%`, tone: 'pink', icon: <AlertCircle /> },
            { label: 'Active Users', value: String(data.activeUsers), change: `+${data.trends.users}%`, tone: 'blue', icon: <Users /> },
            { label: 'Resolved Cases', value: String(data.resolvedCases), change: `+${data.trends.resolved}%`, tone: 'mint', icon: <CheckCircle2 /> }
          ])
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  return { stats, loading, error }
}

export function DashboardStats({ stats, loading, error }: { stats: DashboardStats[], loading: boolean, error: string | null }) {
  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 size={32} className="spinner" />
        <p>Loading dashboard data...</p>
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

  return (
    <>
      {isDemoMode() && (
        <div className="demo-notice">
          <Sparkles size={14} /> Demo mode - using mock data
        </div>
      )}
      <div className="stat-grid">
        {stats.map(stat => (
          <Card className="stat-card" key={stat.label}>
            <span className={`stat-icon ${stat.tone}`}>{stat.icon}</span>
            <span>{stat.label}</span>
            <b>{stat.value}</b>
            <small className="positive">
              <TrendingUp size={13} /> {stat.change} this month
            </small>
          </Card>
        ))}
      </div>
    </>
  )
}