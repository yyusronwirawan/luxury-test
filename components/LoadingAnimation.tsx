"use client"

import { motion } from "framer-motion"
import { Diamond } from "lucide-react"
import { useLoading } from "@/app/contexts/LoadingContext"

export const LoadingAnimation = () => {
  const { isLoading } = useLoading()

  if (!isLoading) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
    >
      <div className="relative">
        <motion.div
          className="w-32 h-32"
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          <Diamond className="w-full h-full text-gold" />
        </motion.div>
        <motion.div
          className="absolute inset-0"
          animate={{
            rotate: -360,
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          <Diamond className="w-full h-full text-white opacity-30" />
        </motion.div>
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16"
          animate={{
            scale: [0.8, 1.1, 0.8],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          <Diamond className="w-full h-full text-gold" />
        </motion.div>
      </div>
    </motion.div>
  )
}

