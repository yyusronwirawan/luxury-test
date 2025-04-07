"use client"

import { createContext, useContext, useEffect } from "react"
import { toast } from "sonner"
import { websocketService } from "../services/websocket"

interface NotificationContextType {
  sendNotification: (message: string, type?: "success" | "error" | "info") => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const unsubscribe = websocketService.subscribe(
      "NOTIFICATION",
      (notification: {
        message: string
        type: "success" | "error" | "info"
      }) => {
        switch (notification.type) {
          case "success":
            toast.success(notification.message)
            break
          case "error":
            toast.error(notification.message)
            break
          default:
            toast.info(notification.message)
        }
      },
    )

    return () => unsubscribe()
  }, [])

  const sendNotification = (message: string, type: "success" | "error" | "info" = "info") => {
    websocketService.send({
      type: "NOTIFICATION",
      payload: { message, type },
    })
  }

  return <NotificationContext.Provider value={{ sendNotification }}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider")
  }
  return context
}

