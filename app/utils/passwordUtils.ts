import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import crypto from "crypto"

// Constants for security settings
const SALT_ROUNDS = 12
const PEPPER = process.env.NEXT_PUBLIC_PASSWORD_PEPPER || "default-pepper-value"

// Interface for password validation
interface PasswordValidation {
  isValid: boolean
  errors: string[]
}

// Interface for password strength
interface PasswordStrength {
  score: number // 0-4
  feedback: string
  isStrong: boolean
}

// Generate a secure hash combining salt and pepper
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const pepperedPassword = `${password}${PEPPER}`
    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    const hash = await bcrypt.hash(pepperedPassword, salt)
    return hash
  } catch (error) {
    console.error("Error hashing password:", error)
    throw new Error("Password hashing failed")
  }
}

// Verify password against stored hash
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    const pepperedPassword = `${password}${PEPPER}`
    return await bcrypt.compare(pepperedPassword, hash)
  } catch (error) {
    console.error("Password verification error:", error)
    return false
  }
}

// Generate device fingerprint
export const generateDeviceFingerprint = (): string => {
  try {
    const userAgent = window.navigator.userAgent
    const screenResolution = `${window.screen.width}x${window.screen.height}`
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const language = window.navigator.language
    const platform = window.navigator.platform

    const deviceInfo = `${userAgent}-${screenResolution}-${timeZone}-${language}-${platform}`
    const charCodes = Array.from(deviceInfo).map((char) => char.charCodeAt(0))
    const randomBytes = new Uint8Array(charCodes.slice(0, 16)) // UUIDv4 hanya perlu 16 byte

    return uuidv4({ random: randomBytes })
  } catch (error) {
    console.error("Error generating device fingerprint:", error)
    return uuidv4() // Fallback to random UUID
  }
}

// Validate password strength
export const validatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0
  let feedback = ""
  const minLength = 8

  if (password.length >= minLength) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score < 2) feedback = "Password is too weak."
  else if (score < 3) feedback = "Password could be stronger."
  else feedback = "Password is strong."

  return {
    score,
    feedback,
    isStrong: score >= 3,
  }
}

// Generate a secure session token
export const generateSessionToken = (): string => {
  return crypto.randomBytes(32).toString("hex")
}

// Hash IP address for anonymization
export const hashIPAddress = (ip: string): string => {
  return crypto.createHash("sha256").update(ip).digest("hex")
}

// Sanitize input to prevent injection attacks
export const sanitizeInput = (input: string): string => {
  return input.replace(/[^\w\s@.-]/gi, '')
}
