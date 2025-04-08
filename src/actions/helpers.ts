'use server'

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import { connectToDatabase } from '@/libs/mongodb'

export async function testConnection(uri: string) {
  const client = await connectToDatabase(uri)

  return Boolean(client)
}

export async function encryptWithKey(key: string, value: string) {
  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv)
  let encrypted = cipher.update(value, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return `${iv.toString('hex')}:${encrypted}`
}

export async function decryptWithKey(key: string, encrypted: string) {
  const [ivHex, encryptedValue] = encrypted.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const decipher = createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv)
  let decrypted = decipher.update(encryptedValue, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
