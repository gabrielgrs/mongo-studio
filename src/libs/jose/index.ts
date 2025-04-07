import * as jose from 'jose'
import { cookies } from 'next/headers'
import { UserSchema } from '../mongoose/schemas/user'

export type TokenData = Pick<UserSchema, '_id' | 'role'>

export async function decodeToken(token: string) {
  return jose
    .jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
    .then((res) => res.payload as TokenData)
    .catch(() => null)
}

export async function createToken(data: TokenData) {
  return new jose.SignJWT(data)
    .setExpirationTime('1d')
    .setProtectedHeader({ alg: 'HS256' })
    .sign(new TextEncoder().encode(process.env.JWT_SECRET))
}

export async function getTokenData() {
  const cookiesData = await cookies()
  return decodeToken(cookiesData.get('token')?.value!)
}
