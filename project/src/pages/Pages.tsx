import { useMemo, useState, useEffect } from 'react'
import {
  Activity, AlertCircle, ArrowLeft, ArrowRight, BarChart3, Bot, BriefcaseBusiness, CalendarDays, CheckCircle2,
  ChevronRight, ClipboardList, Clock3, FileCheck2, FileText, Headphones, Heart, HeartHandshake, HelpCircle,
  Home, Leaf, LineChart, LockKeyhole, MapPin, MessageCircle, Mic, MoreHorizontal, Paperclip, Phone, Plus,
  Search, Send, Settings, Shield, ShieldCheck, Sparkles, Stethoscope, Target, TrendingUp, UserCheck, Users,
  UserRound, WalletCards, X, Zap, Smartphone, Loader2
} from 'lucide-react'
import { AppHeader, PublicHeader } from '../components/PublicHeader'
import { BrandLogo } from '../components/BrandLogo'
import { Button, Card, CheckItem, ConsentNotice, EmergencyBanner, IconButton, RiskBadge, SectionHeading, SelectBox, TrustIndicator } from '../components/UI'
import { Footer } from '../components/Footer'
import { cases, chartData, chatMessages, services } from '../data/mockData'
import type { AssessmentOption } from '../types'
import { useSession } from '../contexts/SessionContext'
import { isDemoMode } from '../services/api'

type Navigate = (page: string) => void

export function LandingPage({ onNavigate }: { onNavigate: Navigate }) {
  return <div className="public-shell landing-page">
    <PublicHeader onNavigate={onNavigate} />
    <main>
      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> A safe space for every voice</span>
          <h1>You are<br /><span>not alone.</span></h1>
          <p className="hero-subtitle">A safe, supportive and confidential space for victims and complainants. Get help, report incidents, and access support services — all in one place.</p>
          <div className="hero-actions"><Button onClick={() => onNavigate('consent')}><MessageCircle size={18} /> Talk to AI Assistant <ArrowRight size={17} /></Button><Button variant="secondary" onClick={() => onNavigate('report')}>Report an Incident</Button></div>
          <EmergencyBanner />
          <div className="hero-proof"><LockKeyhole size={16} /> Your privacy is protected at every step</div>
        </div>
        <div className="hero-art" aria-label="Illustration of a diverse community connected by support">
          <div className="orb orb-one" /><div className="orb orb-two" /><div className="leaf leaf-one" /><div className="leaf leaf-two" />
          <div className="community-art">
            <div className="community-person community-person-left"><span className="community-head" /><span className="community-body" /></div>
            <div className="community-person community-person-right"><span className="community-head" /><span className="community-body" /></div>
            <div className="community-shield"><ShieldCheck size={42} /></div>
            <div className="community-connection connection-one" /><div className="community-connection connection-two" />
          </div>
          <div className="art-card"><Heart size={17} fill="currentColor" /><div><b>Support for every voice.</b><span>Listen. Connect. Move forward.</span></div></div>
          <div className="spark spark-one">✦</div><div className="spark spark-two">✦</div>
        </div>
      </section>
      <section className="trust-strip container"><TrustIndicator icon={<ShieldCheck />} title="Safe & Secure" text="Protected conversations" /><TrustIndicator icon={<LockKeyhole />} title="Confidential" text="You choose what to share" /><TrustIndicator icon={<Sparkles />} title="AI-Powered Support" text="Empathy at first contact" /><TrustIndicator icon={<UserCheck />} title="Connected to Authorities" text="Human help when needed" /></section>
      <section className="landing-callout container"><div><span className="eyebrow">Small steps matter</span><h2>Support should feel<br /><span>within reach.</span></h2></div><p>Whether you need a listening ear, want to report something, or need urgent safety support, you can start here — at your own pace.</p><Button variant="soft" onClick={() => onNavigate('help')}>Explore your options <ArrowRight size={17} /></Button></section>
    </main>
    <Footer />
  </div>
}

export function LoginPage({ onNavigate }: { onNavigate: Navigate }) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [submitted, setSubmitted] = useState(false)

  return <div className="public-shell login-shell">
    <PublicHeader onNavigate={onNavigate} />
    <main className="container login-page">
      <div className="login-intro">
        <span className="eyebrow"><span className="eyebrow-dot" /> A calm, secure return</span>
        <h1>Welcome back to <span>Aawaz.</span></h1>
        <p>Sign in when you are ready. Your support journey stays private and in your control.</p>
        <div className="login-tricolor" aria-label="Saffron, white and green tricolor accent"><span /><span /><span /></div>
        <div className="login-trust"><ShieldCheck size={18} /><span>Protected with thoughtful security and confidential support.</span></div>
      </div>
      <Card className="login-card">
        {!submitted ? <>
          <div className="login-card-heading"><span className="eyebrow">Member sign in</span><h2>Sign in to continue</h2><p>Use your registered email and password.</p></div>
          <form onSubmit={e => { e.preventDefault(); setSubmitted(true) }}>
            <label className="field"><span>Email address</span><input type="email" required placeholder="you@example.com" autoComplete="email" /></label>
            <label className="field"><span>Password</span><input type="password" required minLength={8} placeholder="Enter your password" autoComplete="current-password" /></label>
            <div className="login-options"><label className="remember"><input type="checkbox" /> <span>Remember me</span></label><button type="button" className="text-button">Forgot password?</button></div>
            <label className={`two-factor-optin ${twoFactorEnabled ? 'enabled' : ''}`}><input type="checkbox" checked={twoFactorEnabled} onChange={e => setTwoFactorEnabled(e.target.checked)} /><span className="two-factor-icon"><Smartphone size={18} /></span><span><b>Enable two-factor authentication</b><small>{twoFactorEnabled ? 'You will receive a 6-digit verification code after sign in.' : 'Add an extra layer of protection to your account.'}</small></span></label>
            {twoFactorEnabled && <div className="two-factor-note"><LockKeyhole size={15} /> We recommend keeping 2FA enabled for safer access.</div>}
            <Button type="submit" className="login-submit">Sign in <ArrowRight size={17} /></Button>
          </form>
          <p className="login-footer">New to Aawaz? <button type="button" className="text-button" onClick={() => onNavigate('help')}>Start without an account</button></p>
        </> : <div className="login-verified"><span className="verified-icon"><CheckCircle2 size={28} /></span><span className="eyebrow">Sign in started</span><h2>Check your device</h2><p>{twoFactorEnabled ? 'A verification code would be sent to your registered device. Enter it to complete sign in.' : 'Your details have been accepted for verification.'}</p>{twoFactorEnabled && <label className="field"><span>6-digit verification code</span><input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="000000" autoComplete="one-time-code" /></label>}<Button onClick={() => onNavigate('help')}>{twoFactorEnabled ? 'Verify and continue' : 'Continue'} <ArrowRight size={17} /></Button><button className="text-button" onClick={() => setSubmitted(false)}>Back to sign in</button></div>}
      </Card>
    </main>
  </div>
}

const helpOptions = [
  { title: 'I feel unsafe', text: 'Get immediate help and safety resources', icon: <AlertCircle />, tone: 'pink', action: 'support' },
  { title: 'Report an incident', text: 'File a complaint or share what happened', icon: <FileText />, tone: 'purple', action: 'report' },
  { title: 'Talk to AI Assistant', text: 'Get emotional support and guidance', icon: <Bot />, tone: 'mint', action: 'consent' },
  { title: 'Find Support Services', text: 'Connect with NGOs, counsellors and more', icon: <Users />, tone: 'blue', action: 'support' },
]

export function HelpSelectionPage({ onNavigate }: { onNavigate: Navigate }) {
  return <div className="public-shell app-shell"><PublicHeader onNavigate={onNavigate} /><main className="container narrow-page"><div className="center-heading"><span className="eyebrow">Start where you are</span><h1>How can we help you today?</h1><p>Choose an option to get started. You can change this later.</p></div><div className="help-grid">{helpOptions.map(option => <button key={option.title} className={`help-card tone-${option.tone}`} onClick={() => onNavigate(option.action)}><span className="help-icon">{option.icon}</span><span className="help-arrow"><ArrowRight size={18} /></span><h2>{option.title}</h2><p>{option.text}</p><small>Get started <ChevronRight size={14} /></small></button>)}</div><div className="reassurance"><HeartHandshake size={24} /><div><b>It takes courage to seek help.</b><span>You've already taken the first step.</span></div><span className="reassurance-spark">✦</span></div></main></div>
}

export function ConsentPage({ onNavigate }: { onNavigate: Navigate }) {
  const [consent, setConsent] = useState(false)
  const { createSession, recordConsent, loading, error } = useSession()

  const handleConsent = async () => {
    if (!consent) return

    // Create session first
    await createSession()

    // Then record consent
    await recordConsent('ai_assessment')

    // Navigate to chat
    onNavigate('chat')
  }

  return <div className="public-shell app-shell"><AppHeader onNavigate={onNavigate} title="Before we begin" action={<span className="avatar">AR</span>} /><main className="container consent-page"><div className="consent-illustration"><div className="consent-orb"><ShieldCheck size={52} /></div><span className="mini-spark">✦</span><span className="mini-heart"><Heart size={19} fill="currentColor" /></span></div><Card className="consent-card"><span className="eyebrow">You are in control</span><h1>Before we begin</h1><p className="lead">This conversation may be analyzed by an AI system to identify signs of distress and vulnerability.</p><div className="consent-points"><CheckItem>AI does not decide whether your complaint is genuine.</CheckItem><CheckItem>It does not replace a trained professional or counsellor.</CheckItem><CheckItem>You can stop, skip, or ask for a human at any time.</CheckItem></div>{isDemoMode() && <div className="demo-notice"><Sparkles size={14} /> Demo mode active - using mock data</div>}{error && <div className="error-message"><AlertCircle size={14} /> {error}</div>}<label className={`consent-check ${consent ? 'checked' : ''}`}><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /><span className="fake-check">{consent && <CheckCircle2 size={15} />}</span><span>I understand and consent to AI-assisted assessment.</span></label><ConsentNotice /><div className="consent-actions"><Button disabled={!consent || loading} onClick={handleConsent}>{loading ? <Loader2 size={16} className="spinner" /> : 'I Agree & Continue'} <ArrowRight size={17} /></Button><Button variant="ghost" onClick={() => onNavigate('support')}>Talk to a Human Instead</Button></div></Card></main></div>
}

export function AIChatPage({ onNavigate }: { onNavigate: Navigate }) {
  const [messages, setMessages] = useState(chatMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [chatSessionId, setChatSessionId] = useState<string | null>(null)
  const { session } = useSession()

  // Initialize chat session on component mount
  useEffect(() => {
    const initializeChatSession = async () => {
      try {
        const { chatApi } = await import('../services/api')
        const response = await chatApi.createSession(session?._id)
        if (response.success && response.data) {
          setChatSessionId(response.data.sessionId)
        }
      } catch (err) {
        console.error('Failed to create chat session:', err)
      }
    }

    initializeChatSession()
  }, [session?._id])

  const send = async (customInput?: string) => {
    const messageText = (customInput ?? input).trim()
    if (!messageText) return

    const userMessage = { id: Date.now(), sender: 'user' as const, text: messageText, time: 'Now' }
    setMessages([...messages, userMessage])
    setInput('')
    setError(null)

    // Send to context-aware chat API
    setLoading(true)
    try {
      const { chatApi } = await import('../services/api')
      
      // Use chat session ID or fall back to session ID
      const sessionId = chatSessionId || session?._id
      
      if (!sessionId) {
        throw new Error('No active session')
      }

      const response = await chatApi.sendMessage(
        sessionId,
        messageText,
        session?._id,
        { timestamp: new Date().toISOString() }
      )

      if (response.success && response.data) {
        const aiResponse = {
          id: Date.now() + 1,
          sender: 'ai' as const,
          text: response.data.message,
          time: 'Now'
        }
        setMessages(prev => [...prev, aiResponse])

        // If AI suggests assessment, offer it
        if (response.data.requiresAssessment) {
          setTimeout(() => {
            const assessmentPrompt = {
              id: Date.now() + 2,
              sender: 'ai' as const,
              text: "Based on our conversation, a stress check-in might be helpful. Would you like to try a brief assessment?",
              time: 'Now'
            }
            setMessages(prev => [...prev, assessmentPrompt])
          }, 1000)
        }
      } else {
        setError(response.error || 'Failed to get response')
        const errorMessage = {
          id: Date.now() + 1,
          sender: 'ai' as const,
          text: response.error
            ? `I hit a problem while preparing that response: ${response.error}. Please try again or ask a different question.`
            : "I'm having trouble processing that right now. Please try again or talk to a human.",
          time: 'Now'
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai' as const,
        text: "I'm having trouble connecting right now. Please try again.",
        time: 'Now'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleVoiceInput = async () => {
    if (recording) {
      // Stop recording logic would go here
      setRecording(false)
      return
    }

    // Check if browser supports MediaRecorder
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Voice recording is not supported in this browser')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
          const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' })

          const { chatApi } = await import('../services/api')
          const transcriptionResponse = await chatApi.transcribeAudio(audioFile)

          if (!transcriptionResponse.success || !transcriptionResponse.data?.text) {
            throw new Error(transcriptionResponse.error || 'Transcription failed')
          }

          const transcription = transcriptionResponse.data.text.trim()
          setInput(transcription)
          setError(null)
          await send(transcription)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Audio transcription failed')
          console.error('Voice recording transcription error:', err)
        } finally {
          stream.getTracks().forEach(track => track.stop())
        }
      }

      setRecording(true)
      mediaRecorder.start()

      // Stop recording after 5 seconds
      setTimeout(() => {
        if (recording) {
          mediaRecorder.stop()
          setRecording(false)
        }
      }, 5000)

    } catch (err) {
      setError('Microphone access denied or not available')
      console.error('Voice recording error:', err)
    }
  }

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement> | any) => {
    let file: File | null = null

    // Handle both file input and direct file object
    if (e.target && e.target.files) {
      file = e.target.files[0]
    } else if (e instanceof File) {
      file = e
    }

    if (!file) return

    setAudioFile(file)
    setError(null)

    // Upload audio for assessment
    setLoading(true)
    try {
      const { assessmentApi } = await import('../services/api')
      const response = await assessmentApi.createAudioAssessment({
        audioFile: file,
        sessionId: session?._id,
      })

      if (response.success && response.data) {
        const recommendations = response.data.recommendations || []
        const firstRecommendation = recommendations.length > 0 ? recommendations[0] : 'Consider talking to a professional.'

        const aiResponse = {
          id: Date.now() + 1,
          sender: 'ai' as const,
          text: `I've analyzed your voice recording. Your stress assessment shows an SVI score of ${response.data.sviScore}/100 with a ${response.data.riskLevel} risk level. ${firstRecommendation}`,
          time: 'Now'
        }
        setMessages(prev => [...prev, aiResponse])
        localStorage.setItem('current_assessment', JSON.stringify(response.data))
      } else {
        setError(response.error || 'Failed to analyze audio')
        const errorMessage = {
          id: Date.now() + 1,
          sender: 'ai' as const,
          text: "I'm having trouble processing your audio right now. Please try again or type your message instead.",
          time: 'Now'
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload audio')
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai' as const,
        text: "I'm having trouble with audio processing right now. Please try again or type your message instead.",
        time: 'Now'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
      setAudioFile(null)
    }
  }

  return <div className="public-shell chat-shell"><AppHeader onNavigate={onNavigate} title="AI Support Assistant" action={<><button className="end-chat" onClick={() => onNavigate('landing')}><X size={14} /> End Chat</button><span className="avatar">AR</span></>} /><main className="chat-main container"><div className="chat-intro"><span className="ai-avatar"><Bot size={23} /></span><div><b>Aawaz is here with you</b><span>Private and judgment-free</span></div><span className="secure-label"><LockKeyhole size={14} /> Secure</span></div>{isDemoMode() && <div className="demo-notice compact"><Sparkles size={12} /> Demo mode - using mock data</div>}{error && <div className="error-message compact"><AlertCircle size={12} /> {error}</div>}<div className="chat-window"><div className="chat-date">Today · Your conversation is private</div>{messages.map(msg => <div className={`message-row ${msg.sender}`} key={msg.id}><div className="message-bubble">{msg.sender === 'ai' && <span className="bubble-ai"><Sparkles size={13} /></span>}<span>{msg.text}</span><small>{msg.time}</small></div></div>)}{loading && <div className="message-row ai"><div className="message-bubble"><span className="bubble-ai"><Loader2 size={13} className="spinner" /></span><span>Thinking...</span></div></div>}{recording && <div className="message-row ai"><div className="message-bubble"><span className="bubble-ai"><Mic size={13} className="recording" /></span><span>Recording... {recording && '●'}</span></div></div>}<div className="quick-replies"><span>What would you like to talk about?</span><div>{['I feel anxious or stressed', 'I want to report an incident',  'I need someone to talk to', "I'm not sure what to do"].map(reply => <button key={reply} onClick={() => { setInput(reply); setTimeout(() => send(), 100) }} disabled={loading}>{reply}</button>)}</div></div></div><div className="chat-composer"><input type="file" accept="audio/*" onChange={handleAudioUpload} style={{ display: 'none' }} id="audio-upload" /><IconButton label="Upload audio" onClick={() => document.getElementById('audio-upload')?.click()}><Paperclip size={19} /></IconButton><input aria-label="Type your message" placeholder="Type your message..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !loading && send()} disabled={loading} /><IconButton label={recording ? "Stop recording" : "Voice input"} onClick={handleVoiceInput}><Mic size={18} className={recording ? 'recording' : ''} /></IconButton><button className="send-button" onClick={send} disabled={loading || !input.trim()} aria-label="Send message">{loading ? <Loader2 size={16} className="spinner" /> : <Send size={18} />}</button></div><div className="chat-footer"><span>This is an AI assistant and not a replacement for professional help.</span><EmergencyBanner compact /><Button variant="soft" onClick={() => onNavigate('assessment')}>Start Stress Assessment <ArrowRight size={16} /></Button></div></main></div>
}

const assessmentOptions: AssessmentOption[] = [
  { label: 'Calm', icon: '●', tone: 'calm' }, { label: 'Slightly stressed', icon: '◒', tone: 'slight' }, { label: 'Moderately stressed', icon: '●', tone: 'moderate' }, { label: 'Very stressed', icon: '!', tone: 'high' }, { label: 'Overwhelmed', icon: '⌁', tone: 'critical' },
]

export function AssessmentPage({ onNavigate }: { onNavigate: Navigate }) {
  const [selected, setSelected] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { session } = useSession()

  const handleSubmit = async () => {
    if (!selected && !text.trim()) return

    setLoading(true)
    setError(null)

    try {
      const { assessmentApi } = await import('../services/api')
      const assessmentText = text || `I've been feeling ${selected.toLowerCase()} lately.`

      const response = await assessmentApi.createTextAssessment({
        text: assessmentText,
        sessionId: session?._id,
      })

      if (response.success && response.data) {
        // Store assessment data for result page
        localStorage.setItem('current_assessment', JSON.stringify(response.data))
        onNavigate('result')
      } else {
        setError(response.error || 'Assessment failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assessment failed')
    } finally {
      setLoading(false)
    }
  }

  return <div className="public-shell app-shell"><AppHeader onNavigate={onNavigate} title="Stress check-in" action={<span className="step-label">Step 3 of 6</span>} /><main className="container assessment-page"><div className="progress-head"><span>Stress assessment</span><b>50% complete</b></div><div className="progress-track"><span style={{ width: '50%' }} /></div><Card className="assessment-card"><div className="assessment-question"><span className="eyebrow">A gentle check-in</span><h1>How have you been feeling lately?</h1><p>This helps us understand your current state and provide better support.</p></div><label className="field field-full"><span>Tell us more (optional)</span><textarea placeholder="Share what's on your mind..." rows={4} value={text} onChange={e => setText(e.target.value)} /></label><div className="assessment-options" role="radiogroup" aria-label="How have you been feeling lately?">{assessmentOptions.map(option => <button role="radio" aria-checked={selected === option.label} className={`assessment-option ${selected === option.label ? 'selected' : ''}`} key={option.label} onClick={() => setSelected(option.label)}><span className={`mood mood-${option.tone}`}>{option.icon}</span><b>{option.label}</b><span className="radio">{selected === option.label && <span />}</span></button>)}</div>{error && <div className="error-message"><AlertCircle size={14} /> {error}</div>}<div className="assessment-actions"><Button variant="ghost" onClick={() => onNavigate('chat')}><ArrowLeft size={16} /> Back</Button><Button disabled={!selected && !text.trim() || loading} onClick={handleSubmit}>{loading ? <Loader2 size={16} className="spinner" /> : 'Next'} <ArrowRight size={16} /></Button></div></Card><div className="assessment-safe"><ShieldCheck size={18} /><span>Your responses are private and used only to connect you with the right support.</span></div></main></div>
}

export function AssessmentResultPage({ onNavigate }: { onNavigate: Navigate }) {
  return <div className="public-shell app-shell"><PublicHeader onNavigate={onNavigate} /><main className="container result-page"><div className="result-top"><div><span className="eyebrow">Assessment complete</span><h1>Your current status</h1><p>A gentle reflection of what you shared. You can always talk to a human professional.</p></div><Button variant="secondary" onClick={() => onNavigate('assessment')}><Plus size={16} /> New Assessment</Button></div><Card className="status-card"><div className="status-visual"><div className="status-ring"><span>!</span></div><span className="status-caption">AI-assisted assessment</span></div><div className="status-copy"><span className="status-kicker">Your current status</span><h2>Moderate Stress</h2><p>Based on your responses, you may be experiencing moderate levels of stress. It's important to take care of your mental well-being.</p><span className="human-review"><UserCheck size={16} /> Human review recommended</span></div><div className="svi-preview"><span>SVI score</span><b>62 <small>/ 100</small></b><span className="risk risk-medium"><span className="risk-dot" />Medium</span></div></Card><div className="result-grid"><Card><SectionHeading title="Recommended next steps" /><div className="next-step-list"><button><span className="step-icon blue"><Stethoscope size={18} /></span><span><b>Talk to a trained counsellor</b><small>Connect with a professional who can listen.</small></span><ChevronRight /></button><button><span className="step-icon purple"><Leaf size={18} /></span><span><b>Explore self-help resources</b><small>Gentle exercises and practical tips.</small></span><ChevronRight /></button><button><span className="step-icon mint"><Activity size={18} /></span><span><b>Follow-up assessment</b><small>Check in again after a few days.</small></span><ChevronRight /></button></div><Button variant="soft" onClick={() => onNavigate('support')}>Find support services <ArrowRight size={16} /></Button></Card><Card className="result-safety"><SectionHeading title="If you need urgent help" /><p>If you feel unsafe or think you may hurt yourself, you deserve immediate support.</p><Button variant="danger" onClick={() => onNavigate('support')}><Phone size={16} /> Connect to emergency support</Button><EmergencyBanner compact /></Card></div><div className="result-note"><Heart size={17} fill="currentColor" /> You are stronger than you think. Asking for support is a sign of courage.</div></main></div>
}

export function ReportIncidentPage({ onNavigate }: { onNavigate: Navigate }) {
  const [step, setStep] = useState(0)
  const [saved, setSaved] = useState(false)
  const steps = ['Details', 'Evidence', 'Location', 'Review']
  return <div className="public-shell app-shell"><AppHeader onNavigate={onNavigate} title="Report an incident" action={<span className="avatar">AR</span>} /><main className="container report-page"><div className="stepper">{steps.map((item, index) => <div className={`stepper-item ${index <= step ? 'active' : ''}`} key={item}><span>{index < step ? <CheckCircle2 size={15} /> : index + 1}</span><b>{item}</b>{index < steps.length - 1 && <i />}</div>)}</div><Card className="report-card">{saved ? <div className="success-state"><span><CheckCircle2 size={34} /></span><h1>Your draft is saved</h1><p>You can safely return to finish sharing details whenever you're ready.</p><Button onClick={() => setSaved(false)}>Continue here <ArrowRight size={16} /></Button></div> : <><div className="report-heading"><span className="eyebrow">Step {step + 1} of 4</span><h1>{step === 0 ? 'Tell us what happened' : steps[step]}</h1><p>You can share as much or as little as you're comfortable with.</p></div>{step === 0 && <div className="form-grid"><SelectBox label="Type of incident *" value="Select type" options={['Select type', 'Discrimination', 'Violence', 'Threat / intimidation', 'Social boycott', 'Other']} /><label className="field"><span>When did it happen?</span><span className="input-with-icon"><input type="date" /><CalendarDays size={16} /></span></label><label className="field"><span>Time</span><span className="input-with-icon"><input type="time" /><Clock3 size={16} /></span></label><label className="field field-full"><span>Tell us what happened *</span><textarea placeholder="Write in your own words. You can skip anything you do not want to share." rows={5} /></label><label className="consent-check anonymous"><input type="checkbox" /><span className="fake-check" /><span>I want to share this anonymously for now.</span></label></div>}{step === 1 && <div className="upload-box"><span><Paperclip size={25} /></span><h3>Add evidence (optional)</h3><p>Photos, documents or audio can help a trained responder understand. You can also continue without adding anything.</p><Button variant="secondary"><Plus size={16} /> Choose files</Button><small>Maximum 10MB per file · JPG, PNG, PDF, MP3</small></div>}{step === 2 && <div className="location-box"><MapPin size={29} /><h3>Would you like to share your location?</h3><p>This can help connect you to the nearest services. It is optional and you can change your mind later.</p><div className="location-actions"><Button variant="secondary">Share approximate location</Button><Button variant="ghost">Skip for now</Button></div></div>}{step === 3 && <div className="review-box"><div><span>Incident type</span><b>Threat / intimidation</b></div><div><span>Details</span><b>Shared privately with the response team</b></div><div><span>Identity</span><b>Not requested at this stage</b></div><ConsentNotice /></div>}<div className="report-actions"><Button variant="ghost" onClick={() => step === 0 ? onNavigate('help') : setStep(step - 1)}><ArrowLeft size={16} /> Back</Button><div><Button variant="secondary" onClick={() => setSaved(true)}>Save & Continue Later</Button><Button onClick={() => step < 3 ? setStep(step + 1) : onNavigate('help')}>{step === 3 ? 'Submit securely' : 'Next'} <ArrowRight size={16} /></Button></div></div></>}</Card><div className="report-reassurance"><ShieldCheck size={18} /> Identity verification is a separate later step. You do not need Aadhaar or other identity documents to ask for help today.</div></main></div>
}

export function SupportServicesPage({ onNavigate }: { onNavigate: Navigate }) {
  const [active, setActive] = useState('NGOs')
  const [query, setQuery] = useState('')
  const filtered = services.filter(s => s.type === active && s.name.toLowerCase().includes(query.toLowerCase()))
  return <div className="public-shell app-shell"><PublicHeader onNavigate={onNavigate} /><main className="container services-page"><div className="services-heading"><div><span className="eyebrow">A circle of care</span><h1>Support services</h1><p>Connect with trusted organizations and people who are ready to help.</p></div><div className="service-search"><Search size={17} /><input placeholder="Search services" value={query} onChange={e => setQuery(e.target.value)} /></div></div><div className="service-tabs" role="tablist">{['NGOs', 'Counsellors', 'Legal Aid', 'Helplines'].map(tab => <button role="tab" aria-selected={active === tab} className={active === tab ? 'active' : ''} onClick={() => setActive(tab)} key={tab}>{tab}</button>)}</div><div className="service-list">{filtered.map(service => <Card className="service-card" key={service.name}><span className={`service-logo logo-${service.tone}`}>{service.initials}</span><div className="service-content"><div className="service-title"><h3>{service.name}</h3><span className="verified"><CheckCircle2 size={13} /> Verified</span></div><p>{service.description}</p><small><MapPin size={14} /> {service.coverage}</small></div><div className="service-contact"><b>{service.phone}</b><Button variant="secondary"><Phone size={15} /> Contact</Button></div></Card>)}</div>{!filtered.length && <div className="card service-empty"><HelpCircle size={22} /><p>No services match your search yet.</p></div>}<div className="services-bottom"><HeartHandshake size={28} /><div><b>Help is always within reach.</b><span>You deserve support that feels safe and respectful.</span></div><Button variant="soft" onClick={() => onNavigate('chat')}>Talk to Aawaz <ArrowRight size={16} /></Button></div></main></div>
}

function Sidebar({ active, onNavigate }: { active: string; onNavigate: Navigate }) {
  const items = [{ key: 'dashboard', label: 'Dashboard', icon: <Home size={17} /> }, { key: 'cases', label: 'Cases', icon: <BriefcaseBusiness size={17} /> }, { key: 'assessment', label: 'Assessments', icon: <Activity size={17} /> }, { key: 'users', label: 'Users', icon: <Users size={17} /> }, { key: 'support', label: 'Support Services', icon: <HeartHandshake size={17} /> }, { key: 'analytics', label: 'Analytics', icon: <BarChart3 size={17} /> }, { key: 'audit', label: 'Audit Logs', icon: <FileCheck2 size={17} /> }, { key: 'settings', label: 'Settings', icon: <Settings size={17} /> }]
  return <aside className="sidebar"><div className="sidebar-brand"><BrandLogo compact /><span className="role-pill">AUTHORIZED PORTAL</span></div><nav>{items.map(item => <button className={active === item.key ? 'active' : ''} key={item.key} onClick={() => onNavigate(item.key === 'analytics' ? 'analytics' : item.key === 'cases' ? 'case-detail' : 'officer')}><span>{item.icon}</span>{item.label}{item.key === 'cases' && <em>18</em>}</button>)}</nav><div className="sidebar-help"><span><Headphones size={18} /></span><b>Need help?</b><small>Contact support desk</small><button>Get assistance <ArrowRight size={13} /></button></div><div className="sidebar-footer"><LockKeyhole size={13} /> Secure NHAA workspace</div></aside>
}

function DashboardTop({ title, onNavigate }: { title: string; onNavigate: Navigate }) {
  return <div className="dashboard-top"><div><span className="breadcrumb">Workspace / {title}</span><h1>{title}</h1></div><div className="dashboard-top-actions"><button className="date-select"><CalendarDays size={15} /> Last 30 days <ChevronRight size={14} /></button><IconButton label="Notifications"><div className="notification-dot" /><span>♧</span></IconButton><div className="profile"><span className="avatar avatar-purple">AR</span><span><b>Ananya Rao</b><small>NHAA Officer</small></span><ChevronRight size={14} /></div></div></div>
}

export function OfficerDashboardPage({ onNavigate }: { onNavigate: Navigate }) {
  const stats = [{ label: 'Total Cases', value: '124', change: '+12%', tone: 'purple', icon: <BriefcaseBusiness /> }, { label: 'High Risk Cases', value: '18', change: '+5%', tone: 'pink', icon: <AlertCircle /> }, { label: 'Active Users', value: '892', change: '+20%', tone: 'blue', icon: <Users /> }, { label: 'Resolved Cases', value: '93', change: '+18%', tone: 'mint', icon: <CheckCircle2 /> }]
  return <div className="dashboard-shell"><Sidebar active="dashboard" onNavigate={onNavigate} /><main className="dashboard-content"><DashboardTop title="Overview" onNavigate={onNavigate} /><div className="stat-grid">{stats.map(stat => <Card className="stat-card" key={stat.label}><span className={`stat-icon ${stat.tone}`}>{stat.icon}</span><span>{stat.label}</span><b>{stat.value}</b><small className="positive"><TrendingUp size={13} /> {stat.change} this month</small></Card>)}</div><div className="dashboard-grid"><Card className="cases-card"><div className="card-heading"><div><span className="eyebrow">Needs attention</span><h2>Recent cases</h2></div><button onClick={() => onNavigate('case-detail')}>View all <ArrowRight size={14} /></button></div><div className="case-table-wrap"><table><thead><tr><th>Case ID</th><th>Status</th><th>Risk level</th><th>Received</th><th /></tr></thead><tbody>{cases.map(record => <tr key={record.id} onClick={() => onNavigate('case-detail')}><td><b>{record.id}</b><small>{record.summary}</small></td><td><span className={`status status-${record.status.toLowerCase().replace(/ /g, '-')}`}>{record.status}</span></td><td><RiskBadge risk={record.risk} /></td><td>{record.date}</td><td><ChevronRight size={16} /></td></tr>)}</tbody></table></div></Card><Card className="dashboard-insight"><div className="card-heading"><div><span className="eyebrow">Today</span><h2>Response pulse</h2></div><MoreHorizontal size={19} /></div><div className="pulse-score"><div className="pulse-ring"><span>2.4</span><small>hrs</small></div><div><b>Average response time</b><p>You're responding <strong>18% faster</strong> than last month.</p></div></div><div className="mini-bars">{[36, 53, 48, 71, 62, 84, 76].map((height, i) => <span style={{ height: `${height}%` }} className={i === 5 ? 'today' : ''} key={i} />)}</div><small className="chart-label">Mon&nbsp;&nbsp;&nbsp; Tue&nbsp;&nbsp;&nbsp; Wed&nbsp;&nbsp;&nbsp; Thu&nbsp;&nbsp;&nbsp; Fri&nbsp;&nbsp;&nbsp; Sat&nbsp;&nbsp;&nbsp; Sun</small></Card></div><div className="dashboard-bottom"><Card className="quick-actions"><h2>Quick actions</h2><button onClick={() => onNavigate('case-detail')}><span className="purple"><FileText size={17} /></span>Review high-risk cases <ArrowRight /></button><button onClick={() => onNavigate('analytics')}><span className="blue"><BarChart3 size={17} /></span>Open analytics report <ArrowRight /></button><button><span className="mint"><Users size={17} /></span>View support directory <ArrowRight /></button></Card><Card className="dashboard-note"><span className="note-icon"><ShieldCheck size={21} /></span><h3>Human judgment, always</h3><p>AI insights are designed to support your review — never replace it. Complaint verification and vulnerability assessment remain separate decisions.</p><button onClick={() => onNavigate('case-detail')}>View review guidelines <ArrowRight size={14} /></button></Card></div></main></div>
}

export function CaseDetailPage({ onNavigate }: { onNavigate: Navigate }) {
  return <div className="dashboard-shell"><Sidebar active="cases" onNavigate={onNavigate} /><main className="dashboard-content"><DashboardTop title="Case #C-1045" onNavigate={onNavigate} /><div className="case-detail-subhead"><div><button className="back-dashboard" onClick={() => onNavigate('officer')}><ArrowLeft size={15} /> Back to cases</button><p>Received 13 Jul 2025 · Kochi, Kerala</p></div><div><Button variant="secondary"><MoreHorizontal size={17} /> More actions</Button><Button onClick={() => onNavigate('officer')}><CheckCircle2 size={16} /> Save review</Button></div></div><div className="case-layout"><div className="case-main"><Card className="assessment-summary"><div className="card-heading"><div><span className="eyebrow">AI assessment</span><h2>Vulnerability indicators</h2></div><span className="human-review"><UserCheck size={14} /> Human review required</span></div><div className="svi-layout"><div className="svi-gauge"><div className="gauge-inner"><b>82</b><small>/ 100</small><span>SVI score</span></div></div><div className="svi-copy"><RiskBadge risk="High" /><h3>High vulnerability indicators</h3><p>This AI-assisted signal suggests a trained responder should review the case promptly. It is not a diagnosis or a decision about complaint validity.</p><Button variant="soft">View assessment details <ArrowRight size={15} /></Button></div></div><div className="indicator-grid">{[['Fear / threat perception', 88, 'high'], ['Emotional distress', 74, 'high'], ['Social isolation', 52, 'medium'], ['Immediate safety concern', 80, 'high']].map(([label, value, tone]) => <div className="indicator" key={String(label)}><div><span>{label}</span><b>{String(value)}%</b></div><div className="indicator-track"><span className={String(tone)} style={{ width: `${Number(value)}%` }} /></div></div>)}</div></Card><Card className="transcript-card"><div className="card-heading"><div><span className="eyebrow">Recent interaction</span><h2>Conversation transcript</h2></div><button className="text-button">View full transcript <ArrowRight size={14} /></button></div><div className="transcript"><div className="transcript-line ai"><span><Bot size={14} /></span><div><small>Aawaz · 10:24 AM</small><p>Thank you for trusting us. Are you feeling safe right now?</p></div></div><div className="transcript-line user"><div><small>Complainant · 10:25 AM</small><p>I am afraid they may come back. I don't know who to talk to.</p></div></div><div className="transcript-line ai"><span><Bot size={14} /></span><div><small>Aawaz · 10:25 AM</small><p>You deserve support. I will help connect you with a trained responder.</p></div></div></div></Card></div><aside className="case-sidebar"><Card><div className="card-heading"><h2>Verification & consent</h2><FileCheck2 size={17} /></div><dl className="verification-list">{[['Identity', 'Not yet verified', 'pending'], ['Mobile', 'Verified', 'done'], ['Location', 'Provided', 'done'], ['AI assessment consent', 'Recorded', 'done'], ['Data processing consent', 'Recorded', 'done'], ['Evidence', '2 files', 'done'], ['Complaint verification', 'Human Review Pending', 'pending']].map(([label, value, state]) => <div key={label}><dt>{label}</dt><dd className={state}><span>{state === 'done' ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}</span>{value}</dd></div>)}</dl></Card><Card className="support-card"><div className="card-heading"><h2>Recommended support</h2><HeartHandshake size={17} /></div>{['Counselling', 'Legal assistance', 'Safety assessment', 'Emergency intervention if appropriate'].map((item, i) => <div className="support-line" key={item}><span className={`support-number n-${i}`}>{i + 1}</span>{item}<ChevronRight size={15} /></div>)}</Card><Card className="human-actions"><h2>Human actions</h2><Button variant="secondary"><Phone size={15} /> Contact counsellor</Button><Button variant="secondary"><UserCheck size={15} /> Assign case</Button><Button variant="secondary"><FileCheck2 size={15} /> Request verification</Button><Button variant="danger"><Zap size={15} /> Escalate case</Button><Button variant="ghost"><Plus size={15} /> Add case note</Button><p><ShieldCheck size={14} /> Never use AI to mark a complaint fake.</p></Card></aside></div></main></div>
}

function TrendChart() {
  const max = Math.max(...chartData.map(d => d.total))
  return <div className="trend-chart"><div className="chart-y"><span>200</span><span>150</span><span>100</span><span>50</span><span>0</span></div><div className="chart-area"><div className="grid-lines"><i /><i /><i /><i /><i /></div><svg viewBox="0 0 700 220" preserveAspectRatio="none" role="img" aria-label="Case trends line chart"><polyline points={chartData.map((d, i) => `${i * 116 + 10},${205 - (d.total / max) * 180}`).join(' ')} fill="none" stroke="#6542ec" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /><polyline points={chartData.map((d, i) => `${i * 116 + 10},${205 - (d.high / max) * 180}`).join(' ')} fill="none" stroke="#ed4c91" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />{chartData.map((d, i) => <g key={d.label}><circle cx={i * 116 + 10} cy={205 - (d.total / max) * 180} r="5" fill="#6542ec" /><circle cx={i * 116 + 10} cy={205 - (d.high / max) * 180} r="5" fill="#ed4c91" /></g>)}</svg><div className="chart-x">{chartData.map(d => <span key={d.label}>{d.label}</span>)}</div></div></div>
}

export function AdminAnalyticsPage({ onNavigate }: { onNavigate: Navigate }) {
  return <div className="dashboard-shell"><Sidebar active="analytics" onNavigate={onNavigate} /><main className="dashboard-content"><DashboardTop title="Analytics" onNavigate={onNavigate} /><div className="analytics-metrics">{[['Total reports', '1,243', '+12.4%', 'purple'], ['Users', '892', '+8.2%', 'blue'], ['High-risk cases', '18', '+5%', 'pink'], ['Avg. response time', '2.4', '−18%', 'mint']].map(([label, value, change, tone]) => <Card className="analytics-metric" key={label}><span className={`metric-icon ${tone}`}><TrendingUp size={16} /></span><span>{label}</span><b>{value}<small>{label === 'Avg. response time' && ' hrs'}</small></b><em className={String(change).startsWith('−') ? 'good' : ''}>{change}</em></Card>)}</div><div className="analytics-grid"><Card className="trend-card"><div className="card-heading"><div><span className="eyebrow">Last 30 days</span><h2>Case trends</h2></div><div className="chart-legend"><span className="legend-total" /> Total cases <span className="legend-high" /> High risk</div></div><TrendChart /></Card><Card className="resolution-card"><div className="card-heading"><div><span className="eyebrow">This month</span><h2>Resolution rate</h2></div><MoreHorizontal size={18} /></div><div className="resolution-ring"><div><b>74%</b><span>resolved</span></div></div><div className="resolution-meta"><span><i className="dot green" /> Resolved <b>93</b></span><span><i className="dot pale" /> Active <b>31</b></span></div></Card><Card className="distribution-card"><div className="card-heading"><div><span className="eyebrow">All reports</span><h2>Case distribution</h2></div><MoreHorizontal size={18} /></div><div className="distribution-body"><div className="donut"><span><b>1,243</b><small>Total</small></span></div><ul><li><i className="purple" /> Harassment <b>38%</b></li><li><i className="pink" /> Domestic violence <b>22%</b></li><li><i className="orange" /> Cyber abuse <b>15%</b></li><li><i className="blue" /> Other <b>25%</b></li></ul></div></Card><Card className="high-risk-card"><div className="card-heading"><div><span className="eyebrow">Attention needed</span><h2>High-risk trends</h2></div><span className="risk risk-high"><span className="risk-dot" />18 open</span></div><div className="high-risk-bars">{[['Mon', 40], ['Tue', 53], ['Wed', 45], ['Thu', 69], ['Fri', 60], ['Sat', 82], ['Sun', 73]].map(([day, value]) => <div key={day}><span style={{ height: `${value}%` }} /><small>{day}</small></div>)}</div></Card></div></main></div>
}
