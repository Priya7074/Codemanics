import { Heart, MapPin } from 'lucide-react'
import { BrandLogo } from './BrandLogo'

export function Footer() {
  return <footer className="footer"><BrandLogo /><div className="footer-links"><a>People</a><a>Privacy</a><a>Dignity</a><a>Justice</a><a>Healing</a></div><div className="footer-end"><i>A safer tomorrow, together.</i><span><MapPin size={14} /> India</span></div><div className="footer-heart"><Heart size={16} fill="currentColor" /></div></footer>
}
