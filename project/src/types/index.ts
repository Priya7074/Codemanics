export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical'
export type UserRole = 'resident' | 'officer' | 'admin'

export interface CaseRecord {
  id: string
  status: 'Open' | 'In Progress' | 'Resolved'
  risk: RiskLevel
  date: string
  summary: string
  location: string
  score: number
}

export interface Service {
  name: string
  type: 'NGOs' | 'Counsellors' | 'Legal Aid' | 'Helplines'
  description: string
  coverage: string
  phone: string
  tone: string
  initials: string
}

export interface ChatMessage {
  id: number
  sender: 'ai' | 'user'
  text: string
  time: string
}

export interface AssessmentOption {
  label: string
  icon: string
  tone: string
}

// Backend API types
export interface EmotionalIndicators {
  sentiment: number
  distress: number
  fear: number
  anxiety: number
  anger: number
  sadness: number
  hope: number
}

export interface AssessmentResult {
  _id: string
  sessionId: string
  type: 'text' | 'audio'
  content: string
  emotionalIndicators: EmotionalIndicators
  sviScore: number
  riskLevel: RiskLevel
  safetyEscalation: boolean
  recommendations: string[]
  createdAt: string
  requiresHumanReview: boolean
}

export interface ContributingIndicator {
  label: string
  value: number
  severity: 'low' | 'medium' | 'high'
}

export interface RiskAnalysis {
  assessmentId: string
  sviScore: number
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical'
  contributingIndicators: ContributingIndicator[]
  confidence: number
  safetyEscalation: boolean
  requiresHumanReview: boolean
}

export interface Recommendation {
  _id: string
  assessmentId: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  title: string
  description: string
  actionableSteps: string[]
  status: 'pending' | 'in_progress' | 'completed'
  createdAt: string
}

export interface AssessmentTrend {
  assessmentId: string
  date: string
  sviScore: number
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical'
}

// Add Assessment interface for API compatibility
export interface Assessment {
  _id: string
  sessionId: string
  type: 'text' | 'audio'
  content: string
  emotionalIndicators: EmotionalIndicators
  sviScore: number
  riskLevel: RiskLevel
  safetyEscalation: boolean
  recommendations: string[]
  createdAt: string
  requiresHumanReview: boolean
}
