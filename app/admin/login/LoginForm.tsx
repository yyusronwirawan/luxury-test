"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/app/contexts/AuthContext";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function LoginForm() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [securityLevel, setSecurityLevel] = useState<"weak" | "medium" | "strong">("weak");
  const [lastAttempt, setLastAttempt] = useState<Date | null>(null);
  const [ipAddress, setIpAddress] = useState<string>("");
  const [browserInfo, setBrowserInfo] = useState<string>("");
  const [remainingTime, setRemainingTime] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, checkAuth } = useAuth();

  useEffect(() => {
    const validateAuth = async () => {
      const isAuthed = await checkAuth();
      if (isAuthed) {
        const returnTo = searchParams.get("from") || "/admin";
        router.replace(returnTo);
      }
    };

    validateAuth();
  }, [checkAuth, router, searchParams]);

  useEffect(() => {
    const getClientInfo = async () => {
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();
        setIpAddress(ipData.ip);
        setBrowserInfo(window.navigator.userAgent);
      } catch (error) {
        console.error("Error getting client info:", error instanceof Error ? error.message : "Unknown error");
      }
    };

    getClientInfo();
  }, []);

  useEffect(() => {
    const checkPasswordStrength = (password: string) => {
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      const isLongEnough = password.length >= 8;

      if (hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough) {
        setSecurityLevel("strong");
      } else if ((hasUpperCase || hasLowerCase) && hasNumbers && isLongEnough) {
        setSecurityLevel("medium");
      } else {
        setSecurityLevel("weak");
      }
    };

    checkPasswordStrength(formData.password);
  }, [formData.password]);

  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime((time) => Math.max(0, time - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [remainingTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(formData.username, formData.password);

      if (result.success) {
        router.push("/admin");
      } else {
        setError(result.message);
        setLastAttempt(new Date());

        if (result.message.includes("locked")) {
          const minutes = Number.parseInt(result.message.match(/\d+/)?.[0] || "0");
          setRemainingTime(minutes * 60);
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const getSecurityLevelColor = () => {
    switch (securityLevel) {
      case "strong":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "weak":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1f2e] flex items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Image src="/logo.png" alt="Logo" width={120} height={40} className="object-contain" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-[#1a1f2e] border-gray-800 text-white">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-16 h-16 bg-gradient-to-tr from-gold to-yellow-500 rounded-xl mx-auto flex items-center justify-center"
            >
              <ShieldCheck className="w-8 h-8 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-white">Admin Login</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-900/20 text-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Authentication Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className={cn(
                      "pl-10 bg-[#242837] border-gray-700 text-white placeholder:text-gray-500",
                      "focus:border-gold focus:ring-gold/50"
                    )}
                    required
                    disabled={isLoading || remainingTime > 0}
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={cn(
                      "pl-10 pr-10 bg-[#242837] border-gray-700 text-white placeholder:text-gray-500",
                      "focus:border-gold focus:ring-gold/50"
                    )}
                    required
                    disabled={isLoading || remainingTime > 0}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Password Strength</span>
                      <span className="text-white capitalize">{securityLevel}</span>
                    </div>
                    <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className={cn("h-full", getSecurityLevelColor())}
                        initial={{ width: "0%" }}
                        animate={{
                          width: securityLevel === "strong" ? "100%" : securityLevel === "medium" ? "66%" : "33%",
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || remainingTime > 0}
                className={cn(
                  "w-full bg-[#D4AF37] hover:bg-[#B4941F]",
                  "text-black font-medium",
                  "transition-all duration-200"
                )}
              >
                {isLoading ? (
                  <motion.div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Authenticating...
                  </motion.div>
                ) : remainingTime > 0 ? (
                  <motion.div className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Locked ({Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, "0")})
                  </motion.div>
                ) : (
                  "Login to Admin Panel"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="block text-center space-y-4">
            <p className="text-sm text-gray-400">Protected admin area. Unauthorized access is prohibited.</p>
            <div className="flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-600">Secure 256-bit encrypted connection</span>
            </div>
            {lastAttempt && <div className="text-xs text-gray-600">Last attempt: {lastAttempt.toLocaleString()}</div>}
            {ipAddress && <div className="text-xs text-gray-600">Your IP: {ipAddress}</div>}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
