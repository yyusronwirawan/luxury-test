"use client"

import { useState, useEffect } from "react"
import { settingsService } from "../services/settingsService"

export function useSettings() {
  const [settings, setSettings] = useState(settingsService.getSettings())

  useEffect(() => {
    // Subscribe to settings changes
    const unsubscribe = settingsService.subscribe((newSettings) => {
      setSettings(newSettings)
    })

    // Cleanup subscription
    return () => unsubscribe()
  }, [])

  return settings
}

