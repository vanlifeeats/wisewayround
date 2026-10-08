import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const user = req.auth?.user as any
  const role = user?.role || user?.tier || 'guest'

  if (['/admin', '/api/admin'].some(r => pathname.startsWith(r))) {
    // Allow header-based auth for specific admin API endpoints (curl access)
    if (pathname.startsWith('/api/admin/') && req.headers.get('x-admin-secret') === process.env.ADMIN_SECRET && process.env.ADMIN_SECRET) {
      return NextResponse.next()
    }
    // For /admin pages: if user is logged in, let them through — the page
    // itself checks admin via the full auth() session.
    if (pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
      if (!user?.email) {
        const url = req.nextUrl.clone(); url.pathname = '/login'; url.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(url)
      }
      return NextResponse.next()
    }
    // For /api/admin: use token role but also allow through if user is
    // logged in (the route handler's own isAdmin() check decides from there).
    if (role !== 'admin') {
      if (pathname.startsWith('/api/admin')) {
        if (user?.email) return NextResponse.next()
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }
  }
  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
