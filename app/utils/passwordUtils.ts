import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

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
    // Combine password with pepper before hashing
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
    // Combine password with pepper before verification
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

    // Combine device information
    const deviceInfo = `${userAgent}-${screenResolution}-${timeZone}-${language}-${platform}`

    // Generate UUID based on device info
    return uuidv4({ random: Array.from(deviceInfo).map((char) => char.charCodeAt(0)) })
  } catch (error) {
    console.error("Error generating device fingerprint:", error)
    return uuidv4() // Fallback to random UUID
  }
}

// Validate password strength
export const validatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0
  const feedback: string[] = []

  // Length check
  if (password.length < 8) {
    feedback.push("Password should be at least 8 characters long")
  } else {
    score += 1
  }

  // Complexity checks
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  // Provide feedback based on score
  if (score < 3) {
    feedback.push("Add uppercase letters, numbers, and special characters")
  }

  return {
    score,
    feedback: feedback.join(". "),
    isStrong: score >= 3,
  }
}

// Validate password requirements
export const validatePassword = (password: string): PasswordValidation => {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// For development purposes only - to generate a new hash
export const generateHash = async () => {
  const password = "adminmps123"
  const hash = await hashPassword(password)
  console.log("Generated hash for development:", hash)
  return hash
}

// Generate a secure session token
export const generateSessionToken = (): string => {
  return uuidv4()
}

// Hash IP address for storage
export const hashIPAddress = async (ip: string): Promise<string> => {
  return await hashPassword(ip) // Use same hashing mechanism for consistency
}

// Sanitize and validate input
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, "")
}

