"use client"

import type * as React from "react"
import { Clock } from "lucide-react"
import { Input } from "./input"

interface TimePickerInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string
  onChange?: (value: string) => void
}

export function TimePickerInput({ value, onChange, ...props }: TimePickerInputProps) {
  return (
    <div className="relative">
      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input type="time" value={value} onChange={(e) => onChange?.(e.target.value)} className="pl-10" {...props} />
    </div>
  )
}

