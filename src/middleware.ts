import { NextRequest, NextResponse } from 'next/server'
import { cookiesConfigs } from './utils/cookies/configs'

function generateUserKey() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Buffer.from(array).toString('hex')
}

export async function middleware(request: NextRequest) {
  const publicKey = request.cookies.get('publicKey')?.value

  if (!publicKey) {
    const response = NextResponse.next()
    const key = generateUserKey()
    response.cookies.set('publicKey', key, cookiesConfigs)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|assets|icons).*)'],
}
