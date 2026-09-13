import { createContext, useContext, useState, ReactNode } from 'react'
import { sessionApi, consentApi, type Session } from '../services/api'

interface SessionContextType {
  session: Session | null
  loading: boolean
  error: string | null
  createSession: () => Promise<void>
  recordConsent: (consentType: string) => Promise<void>
  endSession: () => Promise<void>
  clearSession: () => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createSession = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await sessionApi.createSession()
      if (response.success && response.data) {
        setSession(response.data)
        // Store session ID in localStorage for persistence
        localStorage.setItem('aawaz_session_id', response.data._id)
      } else {
        setError(response.error || 'Failed to create session')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session')
    } finally {
      setLoading(false)
    }
  }

  const recordConsent = async (consentType: string) => {
    if (!session) {
      setError('No active session')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await consentApi.recordConsent({
        sessionId: session._id,
        consentType: consentType as any,
        consentGiven: true,
      })

      if (response.success) {
        // Update session with consent info
        setSession({
          ...session,
          consentGiven: true,
          consentTimestamp: new Date().toISOString(),
        })
      } else {
        setError(response.error || 'Failed to record consent')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record consent')
    } finally {
      setLoading(false)
    }
  }

  const endSession = async () => {
    if (!session) return

    setLoading(true)
    setError(null)
    try {
      const response = await sessionApi.endSession(session._id)
      if (response.success && response.data) {
        setSession(response.data)
      } else {
        setError(response.error || 'Failed to end session')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end session')
    } finally {
      setLoading(false)
    }
  }

  const clearSession = () => {
    setSession(null)
    localStorage.removeItem('aawaz_session_id')
  }

  // Restore session from localStorage on mount
  useState(() => {
    const savedSessionId = localStorage.getItem('aawaz_session_id')
    if (savedSessionId) {
      sessionApi.getSessionById(savedSessionId).then(response => {
        if (response.success && response.data) {
          setSession(response.data)
        }
      })
    }
  })

  return (
    <SessionContext.Provider
      value={{
        session,
        loading,
        error,
        createSession,
        recordConsent,
        endSession,
        clearSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}