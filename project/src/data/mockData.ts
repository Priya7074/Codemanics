import type { CaseRecord, ChatMessage, Service } from '../types'

export const cases: CaseRecord[] = [
  { id: '#C-1045', status: 'Open', risk: 'High', date: '13 Jul 2025', summary: 'Threats from a known person', location: 'Kochi, Kerala', score: 82 },
  { id: '#C-1044', status: 'In Progress', risk: 'Moderate', date: '13 Jul 2025', summary: 'Workplace discrimination', location: 'Pune, Maharashtra', score: 57 },
  { id: '#C-1043', status: 'Resolved', risk: 'Low', date: '12 Jul 2025', summary: 'Online harassment', location: 'Jaipur, Rajasthan', score: 23 },
  { id: '#C-1042', status: 'Open', risk: 'High', date: '12 Jul 2025', summary: 'Domestic safety concern', location: 'Lucknow, Uttar Pradesh', score: 77 },
  { id: '#C-1041', status: 'In Progress', risk: 'Moderate', date: '11 Jul 2025', summary: 'Social boycott', location: 'Nashik, Maharashtra', score: 48 },
]

export const services: Service[] = [
  { name: 'Aasra Foundation', type: 'NGOs', description: 'Emotional support, counselling and crisis navigation.', coverage: 'Pan India', phone: '1800 220 111', tone: 'purple', initials: 'AF' },
  { name: "Sneha Women's Support", type: 'NGOs', description: 'Safe spaces and practical support for women and children.', coverage: 'Pan India', phone: '1800 102 7272', tone: 'pink', initials: 'SW' },
  { name: 'Manas Mind Care', type: 'Counsellors', description: 'Confidential, trauma-informed counselling with trained professionals.', coverage: '12 cities + online', phone: '1800 890 4040', tone: 'blue', initials: 'MM' },
  { name: 'Nyaya Legal Aid', type: 'Legal Aid', description: 'Free legal consultation and help understanding your options.', coverage: 'Pan India', phone: '15100', tone: 'navy', initials: 'NL' },
  { name: 'NHAA helpline 14566', type: 'Helplines', description: 'Connect with a trained responder for guidance and next steps.', coverage: '24 × 7 nationwide', phone: '14566', tone: 'mint', initials: '14' },
]

export const chatMessages: ChatMessage[] = [
  { id: 1, sender: 'ai', text: "Hi, I'm Aawaz, your AI support assistant. I'm here to listen and help. You can share only what you're comfortable with.", time: '10:24 AM' },
  { id: 2, sender: 'ai', text: 'What would you like to talk about right now?', time: '10:24 AM' },
  { id: 3, sender: 'user', text: 'I feel anxious or stressed', time: '10:25 AM' },
  { id: 4, sender: 'ai', text: 'Thank you for telling me. You do not have to go through this alone. Would you like to try a short check-in about how you have been feeling?', time: '10:25 AM' },
]

export const chartData = [
  { label: '7 Jul', total: 82, high: 21 },
  { label: '8 Jul', total: 111, high: 34 },
  { label: '9 Jul', total: 99, high: 29 },
  { label: '10 Jul', total: 140, high: 58 },
  { label: '11 Jul', total: 132, high: 53 },
  { label: '12 Jul', total: 151, high: 67 },
  { label: '13 Jul', total: 176, high: 91 },
]
