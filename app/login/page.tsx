'use client'
import { Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useTheme } from '@/components/ThemeContext'
import Link from 'next/link'
import { Leaf, ArrowLeft } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const { dark } = useTheme()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/travel-planner'

  const text = dark ? '#f0f0f0' : '#111'
  const textMuted = dark ? '#777' : '#888'
  const card = dark ? '#1c1c1c' : '#ffffff'
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const bg = dark ? '#0f0f0f' : '#F8F4EE'

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: textMuted, textDecoration: 'none', marginBottom: '32px', fontWeight: 500 }}>
          <ArrowLeft size={13} /> Back to Wise Way Round
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: '#F07820', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Leaf size={26} color="white" />
          </div>
          <h1 className="font-display" style={{ fontSize: '26px', fontWeight: 700, color: text, marginBottom: '6px', letterSpacing: '-0.5px' }}>
            Admin sign in
          </h1>
          <p style={{ fontSize: '14px', color: textMuted }}>
            Sign in to manage the travel planner
          </p>
        </div>

        <div style={{ background: card, borderRadius: '20px', border: `1px solid ${border}`, padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <button onClick={() => signIn('google', { callbackUrl })}
            style={{ width: '100%', padding: '13px', borderRadius: '12px', background: dark ? '#1c1c1c' : '#fff', border: `1.5px solid ${border}`, color: text, fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense fallback={<div style={{ minHeight: '100vh' }} />}><LoginForm /></Suspense>
}
