import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
export const metadata: Metadata = { title: 'RAC Expert Intelligence', description: 'Expert relevance and interview board decision support workspace', generator: 'v0.app' }
export const viewport: Viewport = { colorScheme: 'light', themeColor: '#071426' }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html> }
