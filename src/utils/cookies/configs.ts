const ONE_DAY_MAX_AGE = 60 * 60 * 24

export const cookiesConfigs = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  maxAge: ONE_DAY_MAX_AGE,
  secure: process.env.NODE_ENV === 'production',
} as const
