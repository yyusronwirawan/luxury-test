"use client"

import { Star } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onChange?: (rating: number) => void
  className?: string
}

export function StarRating({ rating, size = "md", interactive = false, onChange, className }: StarRatingProps) {
  const sizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type={interactive ? "button" : undefined}
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={interactive ? { scale: 1.2 } : undefined}
          transition={{ delay: star * 0.1, type: "spring", stiffness: 400, damping: 17 }}
          className={cn(
            interactive && "cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-full",
          )}
        >
          <Star
            className={cn(
              sizes[size],
              "transition-colors",
              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300",
            )}
          />
        </motion.button>
      ))}
    </div>
  )
}

