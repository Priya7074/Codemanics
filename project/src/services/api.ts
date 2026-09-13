// API Service Layer for Aawaz Frontend
// Centralized API calls with demo fallback support

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Demo mode flag - set to true if backend is not available
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Chat interfaces
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  metadata?: any
}

export interface ChatSession {
  sessionId: string
  userId?: string
  status: string
  consentGiven?: boolean
  messageCount?: number
  lastMessageTime?: string
  startTime: string
  endTime?: string
  metadata?: any
  createdAt: string
  updatedAt: string
}

export interface ChatResponse {
  message: string
  sessionId: string
  provider: string
  model: string
  confidence: number
  requiresAssessment: boolean
  metadata?: any
  timestamp: string
}

// Assessment interfaces
export interface TextAssessmentRequest {
  text: string
  sessionId?: string
}

export interface AudioAssessmentRequest {
  audioFile: File
  sessionId?: string
}

export interface Assessment {
  _id: string
  sessionId: string
  type: 'text' | 'audio'
  content: string
  emotionalIndicators: {
    sentiment: number
    distress: number
    fear: number
    anxiety: number
    anger: number
    sadness: number
    hope: number
  }
  sviScore: number
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical'
  safetyEscalation: boolean
  recommendations: string[]
  createdAt: string
  requiresHumanReview: boolean
}

export interface AssessmentTrend {
  assessmentId: string
  date: string
  sviScore: number
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical'
}

export interface RiskAnalysis {
  assessmentId: string
  sviScore: number
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical'
  contributingIndicators: {
    label: string
    value: number
    severity: 'low' | 'medium' | 'high'
  }[]
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

// Session interfaces
export interface Session {
  _id: string
  userId?: string
  consentGiven: boolean
  consentTimestamp?: string
  status: 'active' | 'ended' | 'archived'
  metadata: {
    ip?: string
    userAgent?: string
    location?: string
  }
  createdAt: string
  updatedAt: string
}

export interface ConsentRequest {
  sessionId: string
  consentType: 'ai_assessment' | 'data_processing' | 'referral'
  consentGiven: boolean
}

// Dashboard interfaces
export interface DashboardOverview {
  totalCases: number
  highRiskCases: number
  activeUsers: number
  resolvedCases: number
  avgResponseTime: number
  trends: {
    cases: number
    users: number
    highRisk: number
    resolved: number
  }
}

export interface RiskDistribution {
  low: number
  moderate: number
  high: number
  critical: number
  total: number
}

export interface DashboardTrends {
  daily: Array<{
    date: string
    total: number
    highRisk: number
  }>
  weekly: Array<{
    date: string
    total: number
    highRisk: number
  }>
  monthly: Array<{
    date: string
    total: number
    highRisk: number
  }>
}

export interface HighRiskCase {
  _id: string
  sessionId: string
  riskLevel: 'High' | 'Critical'
  sviScore: number
  createdAt: string
  status: string
  requiresHumanReview: boolean
}

export interface RecentAssessment {
  _id: string
  sessionId: string
  type: 'text' | 'audio'
  sviScore: number
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical'
  createdAt: string
}

// Referral interfaces
export interface Referral {
  _id: string
  sessionId: string
  assessmentId: string
  professionalName: string
  professionalType: string
  contactInfo: string
  reason: string
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'declined'
  createdAt: string
  updatedAt: string
}

export interface ReferralRequest {
  sessionId: string
  assessmentId: string
  professionalName: string
  professionalType: string
  contactInfo: string
  reason: string
  urgency: 'low' | 'medium' | 'high' | 'urgent'
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  if (DEMO_MODE) {
    return demoFallback<T>(endpoint, options)
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || 'API request failed',
      }
    }

    return {
      success: true,
      data: data.data || data,
    }
  } catch (error) {
    console.error('API call failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

// Demo fallback data for when backend is not available
function demoFallback<T>(endpoint: string, options: RequestInit): Promise<ApiResponse<T>> {
  console.log('Demo mode: returning mock data for', endpoint)

  // Simulate network delay
  const delay = Math.random() * 500 + 300

  return new Promise((resolve) => {
    setTimeout(() => {
      if (endpoint.includes('/assessment/text')) {
        // Parse the request body to get the actual text input
        let inputText = 'Demo assessment content'
        try {
          if (options.body) {
            const bodyData = JSON.parse(options.body as string)
            inputText = bodyData.text || inputText
          }
        } catch (e) {
          // If parsing fails, use default
        }

        // Generate varied responses based on input
        const lowerText = inputText.toLowerCase()
        let sviScore = 50
        let riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Moderate'
        let distress = 0.5
        let anxiety = 0.5
        let fear = 0.3

        // Enhanced keyword analysis for varied responses (matching backend logic)
        if (lowerText.includes('anxious') || lowerText.includes('worried') || lowerText.includes('stress')) {
          sviScore = 55
          riskLevel = 'Moderate'
          distress = 0.6
          anxiety = 0.7
          fear = 0.4
        } else if (lowerText.includes('scared') || lowerText.includes('afraid') || lowerText.includes('fear')) {
          sviScore = 58
          riskLevel = 'Moderate'
          distress = 0.5
          anxiety = 0.6
          fear = 0.7
        } else if (lowerText.includes('sad') || lowerText.includes('depressed') || lowerText.includes('hopeless')) {
          sviScore = 45
          riskLevel = 'Moderate'
          distress = 0.6
          anxiety = 0.4
          fear = 0.3
        } else if (lowerText.includes('fine') || lowerText.includes('okay') || lowerText.includes('good')) {
          sviScore = 25
          riskLevel = 'Low'
          distress = 0.3
          anxiety = 0.3
          fear = 0.2
        } else if (lowerText.includes('help') || lowerText.includes('support') || lowerText.includes('talk')) {
          sviScore = 48
          riskLevel = 'Moderate'
          distress = 0.5
          anxiety = 0.5
          fear = 0.3
        } else if (lowerText.includes('incident') || lowerText.includes('report') || lowerText.includes('happened')) {
          sviScore = 52
          riskLevel = 'Moderate'
          distress = 0.5
          anxiety = 0.4
          fear = 0.5
        }

        // Add some randomness to make it feel more natural
        sviScore += Math.floor(Math.random() * 10) - 5
        sviScore = Math.max(20, Math.min(90, sviScore))

        const mockAssessment: Assessment = {
          _id: 'demo-assessment-' + Date.now(),
          sessionId: 'demo-session-' + Date.now(),
          type: 'text',
          content: inputText,
          emotionalIndicators: {
            sentiment: 0.5 - (distress * 0.3),
            distress: distress,
            fear: fear,
            anxiety: anxiety,
            anger: 0.2,
            sadness: distress * 0.8,
            hope: 0.5 - (anxiety * 0.3),
          },
          sviScore: sviScore,
          riskLevel: riskLevel,
          safetyEscalation: riskLevel === 'High' || riskLevel === 'Critical',
          recommendations: riskLevel === 'High' || riskLevel === 'Critical'
            ? [
                'Immediate professional review recommended',
                'Contact support helpline',
                'Safety planning recommended',
              ]
            : [
                'Talk to a trained counsellor',
                'Explore self-help resources',
                'Follow-up assessment recommended',
              ],
          createdAt: new Date().toISOString(),
          requiresHumanReview: riskLevel === 'High' || riskLevel === 'Critical',
        }
        resolve({ success: true, data: mockAssessment as T })
      } else if (endpoint.includes('/assessment/audio')) {
        const mockAssessment: Assessment = {
          _id: 'demo-assessment-' + Date.now(),
          sessionId: 'demo-session-' + Date.now(),
          type: 'audio',
          content: 'Demo audio assessment',
          emotionalIndicators: {
            sentiment: 0.2,
            distress: 0.7,
            fear: 0.5,
            anxiety: 0.8,
            anger: 0.3,
            sadness: 0.6,
            hope: 0.3,
          },
          sviScore: 68,
          riskLevel: 'High',
          safetyEscalation: true,
          recommendations: [
            'Immediate professional review recommended',
            'Contact support helpline',
            'Safety planning recommended',
          ],
          createdAt: new Date().toISOString(),
          requiresHumanReview: true,
        }
        resolve({ success: true, data: mockAssessment as T })
      } else if (endpoint.includes('/trend')) {
        const mockTrend: AssessmentTrend[] = [
          {
            assessmentId: 'demo-1',
            date: new Date(Date.now() - 86400000 * 6).toISOString(),
            sviScore: 45,
            riskLevel: 'Moderate',
          },
          {
            assessmentId: 'demo-2',
            date: new Date(Date.now() - 86400000 * 4).toISOString(),
            sviScore: 58,
            riskLevel: 'Moderate',
          },
          {
            assessmentId: 'demo-3',
            date: new Date(Date.now() - 86400000 * 2).toISOString(),
            sviScore: 62,
            riskLevel: 'Moderate',
          },
        ]
        resolve({ success: true, data: mockTrend as T })
      } else if (endpoint.includes('/recommendations')) {
        const mockRecommendations: Recommendation[] = [
          {
            _id: 'demo-rec-1',
            assessmentId: 'demo-assessment',
            priority: 'medium',
            category: 'counselling',
            title: 'Talk to a trained counsellor',
            description: 'Connect with a professional who can listen and provide guidance.',
            actionableSteps: [
              'Call the NHAA helpline 14566',
              'Schedule a counselling session',
              'Prepare questions for the counsellor',
            ],
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'demo-rec-2',
            assessmentId: 'demo-assessment',
            priority: 'low',
            category: 'self_help',
            title: 'Explore self-help resources',
            description: 'Gentle exercises and practical tips for managing stress.',
            actionableSteps: [
              'Practice deep breathing exercises',
              'Try mindfulness meditation',
              'Maintain a daily journal',
            ],
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
        ]
        resolve({ success: true, data: mockRecommendations as T })
      } else if (endpoint.includes('/risk')) {
        const mockRisk: RiskAnalysis = {
          assessmentId: 'demo-assessment',
          sviScore: 62,
          riskLevel: 'Moderate',
          contributingIndicators: [
            { label: 'Fear / threat perception', value: 88, severity: 'high' },
            { label: 'Emotional distress', value: 74, severity: 'high' },
            { label: 'Social isolation', value: 52, severity: 'medium' },
            { label: 'Immediate safety concern', value: 30, severity: 'low' },
          ],
          confidence: 0.78,
          safetyEscalation: false,
          requiresHumanReview: true,
        }
        resolve({ success: true, data: mockRisk as T })
      } else if (endpoint.includes('/dashboard/overview')) {
        const mockOverview: DashboardOverview = {
          totalCases: 124,
          highRiskCases: 18,
          activeUsers: 892,
          resolvedCases: 93,
          avgResponseTime: 2.4,
          trends: {
            cases: 12,
            users: 20,
            highRisk: 5,
            resolved: 18,
          },
        }
        resolve({ success: true, data: mockOverview as T })
      } else if (endpoint.includes('/dashboard/risk-distribution')) {
        const mockDistribution: RiskDistribution = {
          low: 45,
          moderate: 38,
          high: 15,
          critical: 2,
          total: 100,
        }
        resolve({ success: true, data: mockDistribution as T })
      } else if (endpoint.includes('/dashboard/trends')) {
        const mockTrends: DashboardTrends = {
          daily: [
            { date: '7 Jul', total: 82, highRisk: 21 },
            { date: '8 Jul', total: 111, highRisk: 34 },
            { date: '9 Jul', total: 99, highRisk: 29 },
            { date: '10 Jul', total: 140, highRisk: 58 },
            { date: '11 Jul', total: 132, highRisk: 53 },
            { date: '12 Jul', total: 151, highRisk: 67 },
            { date: '13 Jul', total: 176, highRisk: 91 },
          ],
          weekly: [],
          monthly: [],
        }
        resolve({ success: true, data: mockTrends as T })
      } else if (endpoint.includes('/dashboard/high-risk')) {
        const mockHighRisk: HighRiskCase[] = [
          {
            _id: 'demo-case-1',
            sessionId: 'demo-session-1',
            riskLevel: 'High',
            sviScore: 82,
            createdAt: new Date().toISOString(),
            status: 'active',
            requiresHumanReview: true,
          },
          {
            _id: 'demo-case-2',
            sessionId: 'demo-session-2',
            riskLevel: 'Critical',
            sviScore: 91,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            status: 'active',
            requiresHumanReview: true,
          },
        ]
        resolve({ success: true, data: mockHighRisk as T })
      } else if (endpoint.includes('/dashboard/recent-assessments')) {
        const mockRecent: RecentAssessment[] = [
          {
            _id: 'demo-assess-1',
            sessionId: 'demo-session-1',
            type: 'text',
            sviScore: 62,
            riskLevel: 'Moderate',
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'demo-assess-2',
            sessionId: 'demo-session-2',
            type: 'audio',
            sviScore: 45,
            riskLevel: 'Low',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
        ]
        resolve({ success: true, data: mockRecent as T })
      } else if (endpoint.includes('/sessions')) {
        const mockSession: Session = {
          _id: 'demo-session-' + Date.now(),
          consentGiven: true,
          consentTimestamp: new Date().toISOString(),
          status: 'active',
          metadata: {
            ip: '127.0.0.1',
            userAgent: navigator.userAgent,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        resolve({ success: true, data: mockSession as T })
      } else if (endpoint.includes('/consent')) {
        resolve({ success: true, data: { message: 'Consent recorded' } as T })
      } else if (endpoint.includes('/referrals')) {
        if (options.method === 'POST') {
          const mockReferral: Referral = {
            _id: 'demo-referral-' + Date.now(),
            sessionId: 'demo-session',
            assessmentId: 'demo-assessment',
            professionalName: 'Demo Professional',
            professionalType: 'Counsellor',
            contactInfo: 'demo@example.com',
            reason: 'Demo referral',
            urgency: 'medium',
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          resolve({ success: true, data: mockReferral as T })
        } else {
          const mockReferrals: Referral[] = [
            {
              _id: 'demo-referral-1',
              sessionId: 'demo-session',
              assessmentId: 'demo-assessment',
              professionalName: 'Dr. Smith',
              professionalType: 'Counsellor',
              contactInfo: 'smith@example.com',
              reason: 'Moderate stress level',
              urgency: 'medium',
              status: 'pending',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]
          resolve({ success: true, data: mockReferrals as T })
        }
      } else {
        resolve({ success: false, error: 'Demo mode: endpoint not implemented' } as ApiResponse<T>)
      }
    }, delay)
  })
}

// Assessment API
export const assessmentApi = {
  createTextAssessment: async (data: TextAssessmentRequest): Promise<ApiResponse<Assessment>> => {
    const response = await apiCall<any>('/assessment/text', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    // Handle both response formats - direct data or nested in assessment/data
    if (response.success && response.data) {
      const assessmentData = response.data.assessment || response.data.data || response.data
      return {
        success: true,
        data: assessmentData,
      }
    }

    return response
  },

  createAudioAssessment: async (data: AudioAssessmentRequest): Promise<ApiResponse<Assessment>> => {
    const formData = new FormData()
    formData.append('audio', data.audioFile)
    if (data.sessionId) {
      formData.append('sessionId', data.sessionId)
    }

    if (DEMO_MODE) {
      return await demoFallback<Assessment>('/assessment/audio', { method: 'POST' })
    }

    try {
      const url = `${API_BASE_URL}/assessment/audio`
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      })

      const responseData = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: responseData.error || responseData.message || 'Audio upload failed',
        }
      }

      // Handle both response formats - direct data or nested in assessment/data
      const assessmentData = responseData.assessment || responseData.data || responseData
      return {
        success: true,
        data: assessmentData,
      }
    } catch (error) {
      console.error('Audio upload failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  },

  getAssessmentById: async (id: string): Promise<ApiResponse<Assessment>> => {
    return apiCall<Assessment>(`/assessment/${id}`)
  },

  getAssessmentsBySession: async (sessionId: string): Promise<ApiResponse<Assessment[]>> => {
    return apiCall<Assessment[]>(`/assessment/session/${sessionId}`)
  },

  getAssessmentTrend: async (sessionId: string): Promise<ApiResponse<AssessmentTrend[]>> => {
    return apiCall<AssessmentTrend[]>(`/assessment/session/${sessionId}/trend`)
  },

  getRiskAnalysis: async (assessmentId: string): Promise<ApiResponse<RiskAnalysis>> => {
    return apiCall<RiskAnalysis>(`/assessment/risk/${assessmentId}`)
  },

  getRecommendations: async (assessmentId: string): Promise<ApiResponse<Recommendation[]>> => {
    return apiCall<Recommendation[]>(`/assessment/recommendations/${assessmentId}`)
  },
}

// Session API
export const sessionApi = {
  createSession: async (): Promise<ApiResponse<Session>> => {
    return apiCall<Session>('/sessions', {
      method: 'POST',
    })
  },

  getSessionById: async (id: string): Promise<ApiResponse<Session>> => {
    return apiCall<Session>(`/sessions/${id}`)
  },

  updateSession: async (id: string, data: Partial<Session>): Promise<ApiResponse<Session>> => {
    return apiCall<Session>(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  endSession: async (id: string): Promise<ApiResponse<Session>> => {
    return apiCall<Session>(`/sessions/${id}/end`, {
      method: 'PATCH',
    })
  },
}

// Consent API
export const consentApi = {
  recordConsent: async (data: ConsentRequest): Promise<ApiResponse<{ message: string }>> => {
    return apiCall<{ message: string }>('/consent', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getConsentBySession: async (sessionId: string): Promise<ApiResponse<any>> => {
    return apiCall<any>(`/consent/${sessionId}`)
  },
}

// Dashboard API
export const dashboardApi = {
  getOverview: async (): Promise<ApiResponse<DashboardOverview>> => {
    return apiCall<DashboardOverview>('/dashboard/overview')
  },

  getRiskDistribution: async (): Promise<ApiResponse<RiskDistribution>> => {
    return apiCall<RiskDistribution>('/dashboard/risk-distribution')
  },

  getTrends: async (): Promise<ApiResponse<DashboardTrends>> => {
    return apiCall<DashboardTrends>('/dashboard/trends')
  },

  getHighRiskCases: async (): Promise<ApiResponse<HighRiskCase[]>> => {
    return apiCall<HighRiskCase[]>('/dashboard/high-risk')
  },

  getRecentAssessments: async (limit: number = 10): Promise<ApiResponse<RecentAssessment[]>> => {
    return apiCall<RecentAssessment[]>(`/dashboard/recent-assessments?limit=${limit}`)
  },
}

// Referral API
export const referralApi = {
  createReferral: async (data: ReferralRequest): Promise<ApiResponse<Referral>> => {
    return apiCall<Referral>('/referrals', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getReferralsBySession: async (sessionId: string): Promise<ApiResponse<Referral[]>> => {
    return apiCall<Referral[]>(`/referrals/session/${sessionId}`)
  },

  getReferralById: async (id: string): Promise<ApiResponse<Referral>> => {
    return apiCall<Referral>(`/referrals/${id}`)
  },

  updateReferral: async (id: string, data: Partial<Referral>): Promise<ApiResponse<Referral>> => {
    return apiCall<Referral>(`/referrals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  acceptReferral: async (id: string): Promise<ApiResponse<Referral>> => {
    return apiCall<Referral>(`/referrals/${id}/accept`, {
      method: 'PATCH',
    })
  },

  completeReferral: async (id: string): Promise<ApiResponse<Referral>> => {
    return apiCall<Referral>(`/referrals/${id}/complete`, {
      method: 'PATCH',
    })
  },
}

// Health check
export const healthCheck = async (): Promise<ApiResponse<{ status: string }>> => {
  return apiCall<{ status: string }>('/health')
}

// Chat API
export const chatApi = {
  createSession: async (userId?: string, metadata?: any): Promise<ApiResponse<ChatSession>> => {
    return apiCall<ChatSession>('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ userId, metadata }),
    })
  },

  transcribeAudio: async (audioFile: File): Promise<ApiResponse<{ text: string }>> => {
    const formData = new FormData()
    formData.append('audio', audioFile)

    try {
      const response = await fetch(`${API_BASE_URL}/chat/transcribe`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Transcription failed',
        }
      }

      return {
        success: true,
        data: data.data || data,
      }
    } catch (error) {
      console.error('Audio transcription failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  },

  sendMessage: async (sessionId: string, message: string, userId?: string, metadata?: any): Promise<ApiResponse<ChatResponse>> => {
    const response = await apiCall<ChatResponse>('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ sessionId, message, userId, metadata }),
    })

    // Handle both response formats
    if (response.success && response.data) {
      const chatData = response.data.data || response.data
      return {
        success: true,
        data: chatData,
      }
    }

    return response
  },

  getConversationHistory: async (sessionId: string, limit?: number, offset?: number): Promise<ApiResponse<{ messages: ChatMessage[], count: number }>> => {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())
    if (offset) params.append('offset', offset.toString())

    return apiCall<{ messages: ChatMessage[], count: number }>(`/chat/history/${sessionId}?${params.toString()}`)
  },

  getSessionInfo: async (sessionId: string): Promise<ApiResponse<ChatSession>> => {
    return apiCall<ChatSession>(`/chat/sessions/${sessionId}`)
  },

  deleteSession: async (sessionId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiCall<{ message: string }>(`/chat/sessions/${sessionId}`, {
      method: 'DELETE',
    })
  },
}

// Export demo mode status
export const isDemoMode = () => DEMO_MODE