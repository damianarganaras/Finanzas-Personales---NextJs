import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isAuthPage = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register')
  const isProtectedPage = nextUrl.pathname.startsWith('/dashboard') || 
                          nextUrl.pathname.startsWith('/accounts') ||
                          nextUrl.pathname.startsWith('/transactions') ||
                          nextUrl.pathname.startsWith('/budgets') ||
                          nextUrl.pathname.startsWith('/bills') ||
                          nextUrl.pathname.startsWith('/piggy-banks') ||
                          nextUrl.pathname.startsWith('/reports') ||
                          nextUrl.pathname.startsWith('/rules') ||
                          nextUrl.pathname.startsWith('/settings')

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }
    return NextResponse.next()
  }

  if (isProtectedPage) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
