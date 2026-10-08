import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'mark@vanlifeeats.com')
  .split(',').map(e => e.trim().toLowerCase())

// Edge-safe — no Sanity, no Node-only deps. Safe to run in middleware.
export const authConfig = {
  // Use the existing NEXTAUTH_SECRET if AUTH_SECRET isn't set
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: { strategy: 'jwt' as const },
  pages: { signIn: '/login', error: '/login' },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID ? [Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })] : []),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        const email = (user.email || '').toLowerCase()
        const isAdmin = ADMIN_EMAILS.includes(email) || user.role === 'admin'
        token.role = isAdmin ? 'admin' : (user.role || token.role || 'free')
        token.email = email
      }
      return token
    },
    // Edge-safe session — role straight from the JWT, no Sanity
    async session({ session, token }: any) {
      if (session.user) {
        const email = (session.user.email || '').toLowerCase()
        const isAdmin = ADMIN_EMAILS.includes(email) || token.role === 'admin'
        session.user.role = isAdmin ? 'admin' : (token.role || 'free')
        session.user.tier = session.user.role
        session.user.isAdmin = isAdmin
      }
      return session
    },
  },
} satisfies NextAuthConfig
