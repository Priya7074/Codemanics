import { Bell, ChevronDown, Globe2, Menu, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { BrandLogo } from './BrandLogo'
import { Button, IconButton } from './UI'

export function PublicHeader({ onNavigate, dashboard = false }: { onNavigate: (page: string) => void; dashboard?: boolean }) {
  const [open, setOpen] = useState(false)
  return <header className={`top-header ${dashboard ? 'dashboard-header' : ''}`}>
    <BrandLogo />
    {!dashboard && <nav className={open ? 'nav-open' : ''} aria-label="Main navigation">
      <button onClick={() => onNavigate('landing')}>Home</button><button onClick={() => onNavigate('support')}>Support</button><button onClick={() => onNavigate('support')}>Resources</button><button onClick={() => onNavigate('landing')}>About</button>
    </nav>}
    <div className="header-actions">
      <button className="language" aria-label="Choose language"><Globe2 size={16} /> EN <ChevronDown size={14} /></button>
      {!dashboard && <Button variant="secondary" onClick={() => onNavigate('login')}>Login</Button>}
      {dashboard && <><IconButton label="Notifications"><Bell size={18} /></IconButton><div className="profile"><span className="avatar">AR</span><span><b>Ananya Rao</b><small>{dashboard ? 'NHAA Officer' : 'Member'}</small></span><ChevronDown size={15} /></div></>}
      <IconButton label={open ? 'Close menu' : 'Open menu'} className="menu-button" onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</IconButton>
    </div>
  </header>
}

export function AppHeader({ onNavigate, title = 'AI Support Assistant', action }: { onNavigate: (page: string) => void; title?: string; action?: React.ReactNode }) {
  return <header className="app-header"><button className="back-link" onClick={() => onNavigate('help')} aria-label="Back"><span>←</span></button><BrandLogo compact /><div className="app-header-title"><span className="online-dot" />{title}</div><div className="app-header-actions">{action || <><button className="text-button" onClick={() => onNavigate('landing')}>End Chat</button><span className="avatar">AR</span></>}</div></header>
}
