"use client"

import { useCurrency } from "@/app/contexts/CurrencyContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import { DollarSign, Coins } from "lucide-react"

const currencyIcons = {
  IDR: Coins,
  USD: DollarSign,
  THB: Coins,
}

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency()
  const Icon = currencyIcons[currency]

  return (
    <Select value={currency} onValueChange={(value: "IDR" | "USD" | "THB") => setCurrency(value)}>
      <SelectTrigger className="w-[120px] bg-transparent text-white border-white/20 hover:bg-white/10">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currency}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <Icon className="h-4 w-4" />
            </motion.div>
          </AnimatePresence>
          <SelectValue placeholder="Currency" />
        </motion.div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="IDR" className="flex items-center gap-2">
          <Coins className="h-4 w-4 mr-2" />
          IDR
        </SelectItem>
        <SelectItem value="USD" className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 mr-2" />
          USD
        </SelectItem>
        <SelectItem value="THB" className="flex items-center gap-2">
          <Coins className="h-4 w-4 mr-2" />
          THB
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

