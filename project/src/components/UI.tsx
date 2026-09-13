import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { AlertTriangle, ArrowRight, Check, ChevronDown, CircleHelp, LockKeyhole, ShieldCheck } from 'lucide-react'
import type { RiskLevel } from '../types'

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft' }) {
  return <button className={`btn btn-${variant} ${className}`} {...props}>{children}</button>
}

export function IconButton({ label, children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return <button aria-label={label} className={`icon-btn ${className}`} {...props}>{children}</button>
}

export function Card({ children, className = '', ...props }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLElement>) {
  return <section className={`card ${className}`} {...props}>{children}</section>
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  return <span className={`risk risk-${risk.toLowerCase()}`}><span className="risk-dot" />{risk}</span>
}

export function EmergencyBanner({ compact = false }: { compact?: boolean }) {
  return <div className={`emergency ${compact ? 'emergency-compact' : ''}`}><span className="emergency-icon"><AlertTriangle size={16} /></span><span>{compact ? 'Immediate danger? Call 112' : <>In case of immediate danger, call <b>112</b></>}</span></div>
}

export function TrustIndicator({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <div className="trust"><span className="trust-icon">{icon}</span><div><b>{title}</b><small>{text}</small></div></div>
}

export function SectionHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return <div className="section-heading">{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2>{children}</div>
}

export function SelectBox({ label, value, options }: { label: string; value: string; options: string[] }) {
  return <label className="field"><span>{label}</span><span className="select-wrap"><select defaultValue={value} aria-label={label}>{options.map(option => <option key={option}>{option}</option>)}</select><ChevronDown size={16} /></span></label>
}

export function ConsentNotice() {
  return <div className="notice notice-blue"><ShieldCheck size={18} /><span><b>Your privacy matters.</b> You control what you share. Aawaz uses your information only to connect you with support.</span></div>
}

export function EmptyState({ title, text, icon = <CircleHelp size={24} /> }: { title: string; text: string; icon?: ReactNode }) {
  return <div className="empty-state"><span className="empty-icon">{icon}</span><b>{title}</b><p>{text}</p></div>
}

export function CheckItem({ children }: { children: ReactNode }) {
  return <li className="check-item"><span><Check size={14} /></span>{children}</li>
}
