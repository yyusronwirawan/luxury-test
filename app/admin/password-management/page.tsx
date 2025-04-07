"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Eye, EyeOff, Key, Lock, RefreshCw } from "lucide-react"
import { hashPassword, verifyPassword } from "@/app/utils/passwordUtils"
import { toast } from "sonner"

export default function PasswordManagementPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)
  const [generatedHash, setGeneratedHash] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerateHash = async () => {
    if (!newPassword) {
      toast.error("Please enter a password to hash")
      return
    }

    setIsLoading(true)
    try {
      const hash = await hashPassword(newPassword)
      setGeneratedHash(hash)
      toast.success("Password hash generated successfully")
    } catch (error) {
      toast.error("Failed to generate password hash")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyPassword = async () => {
    if (!currentPassword || !generatedHash) {
      toast.error("Please enter both password and hash")
      return
    }

    setIsLoading(true)
    try {
      const isValid = await verifyPassword(currentPassword, generatedHash)
      if (isValid) {
        toast.success("Password verification successful!")
      } else {
        toast.error("Password verification failed!")
      }
    } catch (error) {
      toast.error("Error verifying password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match")
      return
    }

    setIsLoading(true)
    try {
      const hash = await hashPassword(newPassword)
      // Here you would typically save the new hash to your storage/database
      toast.success("Password updated successfully")
      setGeneratedHash(hash)
    } catch (error) {
      toast.error("Failed to update password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold">Password Management</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Password Hash Generator</CardTitle>
            <CardDescription>Generate bcrypt hash for a password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showPasswords ? "text" : "password"}
                placeholder="Enter password to hash"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button onClick={handleGenerateHash} disabled={isLoading || !newPassword} className="w-full">
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Generate Hash
                </>
              )}
            </Button>

            {generatedHash && (
              <Alert>
                <AlertTitle>Generated Hash</AlertTitle>
                <AlertDescription className="break-all font-mono text-xs">{generatedHash}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password Verification</CardTitle>
            <CardDescription>Verify a password against its hash</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showPasswords ? "text" : "password"}
                placeholder="Enter password to verify"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button
              onClick={handleVerifyPassword}
              disabled={isLoading || !currentPassword || !generatedHash}
              className="w-full"
            >
              Verify Password
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your admin password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid gap-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showPasswords ? "text" : "password"}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showPasswords ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => setShowPasswords(!showPasswords)}>
                {showPasswords ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Hide Passwords
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Show Passwords
                  </>
                )}
              </Button>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

