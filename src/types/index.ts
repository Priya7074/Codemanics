export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical'
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
