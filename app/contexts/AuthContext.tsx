"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  verifyPassword,
  generateDeviceFingerprint,
  validatePasswordStrength,
  generateSessionToken,
  hashIPAddress,
  sanitizeInput,
} from "@/app/utils/passwordUtils"

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  user: { username: string } | null
  checkAuth: () => Promise<boolean>
  resetPassword: (email: string) => Promise<boolean>
  updatePassword: (oldPassword: string, newPassword: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Constants
const LOGIN_ATTEMPT_KEY = "login_attempts"
const MAX_LOGIN_ATTEMPTS = 3
const LOCKOUT_DURATION = 30 * 60 * 1000 // 30 minutes
const SUSPICIOUS_IPS_KEY = "suspicious_ips"
const KNOWN_DEVICES_KEY = "known_devices"
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// Admin credentials (in production, these would be in a secure database)
const ADMIN_CREDENTIALS = {
  username: "adminmps",
  // This hash corresponds to "adminmps123" with pepper
  passwordHash: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdsBPtSF9eBwy.K",
  email: "admin@example.com",
}

interface LoginAttempts {
  count: number
  lastAttempt: number
  lockedUntil?: number
  ipAddress?: string
  userAgent?: string
  deviceFingerprint?: string
}

interface KnownDevice {
  deviceId: string
  userAgent: string
  lastUsed: string
  ipAddress: string
  trusted: boolean
  failedAttempts: number
}

interface Session {
  token: string
  createdAt: number
  expiresAt: number
  deviceFingerprint: string
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<{ username: string } | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const initialCheckDone = useRef(false)

  // Get client info with enhanced security
  const getClientInfo = useCallback(async () => {
    try {
      const ipResponse = await fetch("https://api.ipify.org?format=json")
      const ipData = await ipResponse.json()
      const deviceFingerprint = generateDeviceFingerprint()
      const hashedIp = await hashIPAddress(ipData.ip)

      return {
        ipAddress: hashedIp,
        userAgent: window.navigator.userAgent,
        deviceFingerprint,
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error("Error getting client info:", error)
      return null
    }
  }, [])

  // Check if IP is suspicious with rate limiting
  const isSuspiciousIP = (ipAddress: string): boolean => {
    const suspiciousIPs = JSON.parse(localStorage.getItem(SUSPICIOUS_IPS_KEY) || "[]")
    return suspiciousIPs.some((ip: string) => ip === ipAddress)
  }

  // Mark IP as suspicious with expiration
  const markIPAsSuspicious = (ipAddress: string) => {
    const suspiciousIPs = JSON.parse(localStorage.getItem(SUSPICIOUS_IPS_KEY) || "[]")
    if (!suspiciousIPs.includes(ipAddress)) {
      suspiciousIPs.push(ipAddress)
      localStorage.setItem(SUSPICIOUS_IPS_KEY, JSON.stringify(suspiciousIPs))

      // Set expiration for suspicious IP
      setTimeout(() => {
        const currentIPs = JSON.parse(localStorage.getItem(SUSPICIOUS_IPS_KEY) || "[]")
        const updatedIPs = currentIPs.filter((ip: string) => ip !== ipAddress)
        localStorage.setItem(SUSPICIOUS_IPS_KEY, JSON.stringify(updatedIPs))
      }, LOCKOUT_DURATION)
    }
  }

  // Enhanced device management
  const isKnownDevice = (deviceFingerprint: string): boolean => {
    const knownDevices: KnownDevice[] = JSON.parse(localStorage.getItem(KNOWN_DEVICES_KEY) || "[]")
    return knownDevices.some((device) => device.deviceId === deviceFingerprint && device.trusted)
  }

  const addKnownDevice = (deviceInfo: KnownDevice) => {
    const knownDevices: KnownDevice[] = JSON.parse(localStorage.getItem(KNOWN_DEVICES_KEY) || "[]")
    const existingDeviceIndex = knownDevices.findIndex((device) => device.deviceId === deviceInfo.deviceId)

    if (existingDeviceIndex >= 0) {
      knownDevices[existingDeviceIndex] = {
        ...deviceInfo,
        lastUsed: new Date().toISOString(),
      }
    } else {
      knownDevices.push({
        ...deviceInfo,
        failedAttempts: 0,
      })
    }

    localStorage.setItem(KNOWN_DEVICES_KEY, JSON.stringify(knownDevices))
  }

  // Session management
  const createSession = (deviceFingerprint: string): Session => {
    const session: Session = {
      token: generateSessionToken(),
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION,
      deviceFingerprint,
    }
    localStorage.setItem("admin_session", JSON.stringify(session))
    return session
  }

  const validateSession = useCallback(() => {
    const sessionData = localStorage.getItem("admin_session")
    if (!sessionData) return false

    const session: Session = JSON.parse(sessionData)
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem("admin_session")
      return false
    }

    const deviceFingerprint = generateDeviceFingerprint()
    if (session.deviceFingerprint !== deviceFingerprint) {
      localStorage.removeItem("admin_session")
      return false
    }

    return true
  }, [])

  // Enhanced authentication check
  const checkAuth = useCallback(async () => {
    try {
      if (!validateSession()) {
        setIsAuthenticated(false)
        setUser(null)
        return false
      }

      const savedUser = localStorage.getItem("admin_user")
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser)
        setIsAuthenticated(true)
        setUser(parsedUser)
        return true
      }

      return false
    } catch (error) {
      console.error("Auth check error:", error)
      return false
    } finally {
      if (!initialCheckDone.current) {
        setIsLoading(false)
        initialCheckDone.current = true
      }
    }
  }, [validateSession])

  // Login attempt management
  const getLoginAttempts = async (): Promise<LoginAttempts> => {
    const clientInfo = await getClientInfo()
    if (!clientInfo) return { count: 0, lastAttempt: Date.now() }

    const stored = localStorage.getItem(LOGIN_ATTEMPT_KEY)
    if (stored) {
      const attempts = JSON.parse(stored)
      if (attempts.ipAddress === clientInfo.ipAddress) {
        return attempts
      }
    }

    return { count: 0, lastAttempt: Date.now() }
  }

  const updateLoginAttempts = async (success: boolean, deviceFingerprint: string) => {
    const clientInfo = await getClientInfo()
    if (!clientInfo) return false

    const attempts = await getLoginAttempts()
    const now = Date.now()

    if (success) {
      localStorage.removeItem(LOGIN_ATTEMPT_KEY)
      addKnownDevice({
        deviceId: deviceFingerprint,
        userAgent: clientInfo.userAgent,
        ipAddress: clientInfo.ipAddress,
        lastUsed: new Date().toISOString(),
        trusted: true,
        failedAttempts: 0,
      })
      return true
    }

    if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
      attempts.count = 1
    } else {
      attempts.count += 1
    }

    attempts.lastAttempt = now
    attempts.ipAddress = clientInfo.ipAddress
    attempts.userAgent = clientInfo.userAgent
    attempts.deviceFingerprint = deviceFingerprint

    if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
      attempts.lockedUntil = now + LOCKOUT_DURATION
      markIPAsSuspicious(clientInfo.ipAddress)
    }

    localStorage.setItem(LOGIN_ATTEMPT_KEY, JSON.stringify(attempts))
    return false
  }

  // Enhanced login function
  const login = async (username: string, password: string) => {
    try {
      const sanitizedUsername = sanitizeInput(username)
      const sanitizedPassword = sanitizeInput(password)

      const deviceFingerprint = generateDeviceFingerprint()
      const clientInfo = await getClientInfo()

      if (!clientInfo) {
        return { success: false, message: "Unable to verify client information" }
      }

      // Check for suspicious IP
      if (isSuspiciousIP(clientInfo.ipAddress)) {
        return { success: false, message: "Access denied from this IP address" }
      }

      // Check login attempts
      const attempts = await getLoginAttempts()
      if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
        const remainingTime = Math.ceil((attempts.lockedUntil - Date.now()) / 1000 / 60)
        return { success: false, message: `Account locked. Try again in ${remainingTime} minutes.` }
      }

      // Add delay to prevent brute force
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Verify credentials
      if (sanitizedUsername !== ADMIN_CREDENTIALS.username) {
        await updateLoginAttempts(false, deviceFingerprint)
        const attempts = await getLoginAttempts()
        const remaining = MAX_LOGIN_ATTEMPTS - attempts.count
        return {
          success: false,
          message: `Invalid credentials. ${remaining} attempts remaining.`,
        }
      }

      const isPasswordValid = await verifyPassword(sanitizedPassword, ADMIN_CREDENTIALS.passwordHash)

      if (isPasswordValid) {
        // Create session and update state
        const session = createSession(deviceFingerprint)
        const userInfo = {
          username: ADMIN_CREDENTIALS.username,
          lastLogin: new Date().toISOString(),
        }

        localStorage.setItem("admin_user", JSON.stringify(userInfo))
        await updateLoginAttempts(true, deviceFingerprint)

        setIsAuthenticated(true)
        setUser(userInfo)

        return { success: true, message: "Login successful" }
      }

      // Handle failed login
      await updateLoginAttempts(false, deviceFingerprint)
      const updatedAttempts = await getLoginAttempts()
      const remaining = MAX_LOGIN_ATTEMPTS - updatedAttempts.count
      return {
        success: false,
        message: `Invalid credentials. ${remaining} attempts remaining.`,
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "An error occurred during login" }
    }
  }

  // Enhanced logout
  const logout = useCallback(() => {
    localStorage.removeItem("admin_session")
    localStorage.removeItem("admin_user")
    setIsAuthenticated(false)
    setUser(null)
    router.replace("/admin/login")
  }, [router])

  // Password reset functionality
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const sanitizedEmail = sanitizeInput(email)
      if (sanitizedEmail !== ADMIN_CREDENTIALS.email) {
        return false
      }

      // In a real app, send reset email
      console.log("Password reset requested for:", sanitizedEmail)
      return true
    } catch (error) {
      console.error("Password reset error:", error)
      return false
    }
  }

  // Update password with security checks
  const updatePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const sanitizedOldPassword = sanitizeInput(oldPassword)
      const sanitizedNewPassword = sanitizeInput(newPassword)

      // Verify old password
      const isValid = await verifyPassword(sanitizedOldPassword, ADMIN_CREDENTIALS.passwordHash)
      if (!isValid) {
        return false
      }

      // Validate new password strength
      const strength = validatePasswordStrength(sanitizedNewPassword)
      if (!strength.isStrong) {
        return false
      }

      // In a real app, update password in database
      console.log("Password updated successfully")
      return true
    } catch (error) {
      console.error("Password update error:", error)
      return false
    }
  }

  // Redirect on auth state change
  useEffect(() => {
    const initAuth = async () => {
      const isAuthed = await checkAuth()
      if (initialCheckDone.current && !isAuthed && pathname?.startsWith("/admin") && pathname !== "/admin/login") {
        router.replace("/admin/login")
      }
    }

    initAuth()
  }, [pathname, router, checkAuth])

  const contextValue = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    user,
    checkAuth,
    resetPassword,
    updatePassword,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

