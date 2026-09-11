import { useEffect, useState } from 'react'
import { AdminAnalyticsPage, AIChatPage, AssessmentPage, AssessmentResultPage, CaseDetailPage, ConsentPage, HelpSelectionPage, LandingPage, OfficerDashboardPage, ReportIncidentPage, SupportServicesPage } from './pages/Pages'
import './styles/global.css'

type Route = 'landing' | 'help' | 'consent' | 'chat' | 'assessment' | 'result' | 'report' | 'support' | 'officer' | 'case-detail' | 'analytics'

function routeFromHash(): Route {
  const route = window.location.hash.replace('#/', '') as Route
  return route || 'landing'
}

export default function App() {
  const [route, setRoute] = useState<Route>(routeFromHash)
  const navigate = (page: string) => {
    const next = page as Route
    window.history.pushState({}, '', `#/${next}`)
    setRoute(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  useEffect(() => {
    const onPop = () => setRoute(routeFromHash())
    window.addEventListener('popstate', onPop)
    window.addEventListener('hashchange', onPop)
    return () => { window.removeEventListener('popstate', onPop); window.removeEventListener('hashchange', onPop) }
  }, [])

  switch (route) {
    case 'help': return <HelpSelectionPage onNavigate={navigate} />
    case 'consent': return <ConsentPage onNavigate={navigate} />
    case 'chat': return <AIChatPage onNavigate={navigate} />
    case 'assessment': return <AssessmentPage onNavigate={navigate} />
    case 'result': return <AssessmentResultPage onNavigate={navigate} />
    case 'report': return <ReportIncidentPage onNavigate={navigate} />
    case 'support': return <SupportServicesPage onNavigate={navigate} />
    case 'officer': return <OfficerDashboardPage onNavigate={navigate} />
    case 'case-detail': return <CaseDetailPage onNavigate={navigate} />
    case 'analytics': return <AdminAnalyticsPage onNavigate={navigate} />
    default: return <LandingPage onNavigate={navigate} />
  }
}
