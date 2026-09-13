import { HeartHandshake } from 'lucide-react'

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand" aria-label="Aawaz home">
      <span className="brand-mark"><HeartHandshake size={compact ? 18 : 20} strokeWidth={2.5} /></span>
      <span><strong>Aawaz</strong>{!compact && <small>You are not alone</small>}</span>
    </div>
  )
}
