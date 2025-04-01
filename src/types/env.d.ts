declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
    VERCEL_ENV: 'production' | 'development' | 'preview'
    MONGODB_URI: string
    RESEND_KEY: string
  }
}
