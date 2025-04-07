type WebSocketMessage = {
  type: "PRODUCT_UPDATE" | "PROMOTION_UPDATE" | "STOCK_UPDATE" | "NOTIFICATION"
  payload: any
}

type WebSocketCallback = (data: any) => void
type ReconnectCallback = () => void

class WebSocketService {
  private static instance: WebSocketService
  private ws: WebSocket | null = null
  private subscribers: Map<string, Set<WebSocketCallback>> = new Map()
  private reconnectCallbacks: Set<ReconnectCallback> = new Set()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectInterval = 1000 // Start with 1 second
  private reconnectTimer: NodeJS.Timeout | null = null
  private forcedClose = false
  private isConnecting = false
  private readonly CONNECTION_TIMEOUT = 20000 // 20 detik
  private readonly ALTERNATIVE_WS_URLS = [
    "wss://echo.websocket.org",
    "wss://socketsbay.com/wss/v2/1/demo/",
    "wss://ws.postman-echo.com/raw",
  ]

  private constructor() {
    if (typeof window !== "undefined") {
      this.connect()
    }
  }

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService()
    }
    return WebSocketService.instance
  }

  private isValidWebSocketUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url)
      return parsedUrl.protocol === "ws:" || parsedUrl.protocol === "wss:"
    } catch {
      return false
    }
  }

  private getWebSocketUrl(): string {
    if (typeof window === "undefined") {
      return "" // Return empty string if not in browser environment
    }

    // Check if we're in a Vercel environment
    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
      // Use HTTPS for Vercel environments
      return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/ws`
    }

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const wsHost = process.env.NEXT_PUBLIC_WS_HOST || window.location.hostname
    const wsPort = process.env.NEXT_PUBLIC_WS_PORT || window.location.port
    const wsPath = process.env.NEXT_PUBLIC_WS_PATH || "/ws"

    return `${wsProtocol}//${wsHost}${wsPort ? `:${wsPort}` : ""}${wsPath}`
  }

  private async connect() {
    if (this.isConnecting) {
      console.log("WebSocket connection attempt already in progress")
      return
    }

    this.isConnecting = true

    const urls = [this.getWebSocketUrl(), ...this.ALTERNATIVE_WS_URLS]

    for (const url of urls) {
      try {
        console.log(`Attempting to connect to WebSocket at ${url}`)
        this.ws = new WebSocket(url)

        await this.waitForConnection(this.ws)

        this.ws.onopen = this.handleOpen.bind(this)
        this.ws.onmessage = this.handleMessage.bind(this)
        this.ws.onclose = this.handleClose.bind(this)
        this.ws.onerror = this.handleError.bind(this)

        console.log("WebSocket connected successfully")
        this.isConnecting = false
        return
      } catch (error) {
        console.error(`Failed to connect to ${url}:`, error)
      }
    }

    console.error("All WebSocket connection attempts failed")
    this.isConnecting = false
    this.scheduleReconnect()
  }

  private waitForConnection(ws: WebSocket): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Koneksi WebSocket timeout"))
        ws.close()
      }, this.CONNECTION_TIMEOUT)

      ws.onopen = () => {
        clearTimeout(timer)
        resolve()
      }

      ws.onerror = (err) => {
        clearTimeout(timer)
        reject(err)
      }
    })
  }

  private handleOpen(event: Event) {
    console.log("WebSocket Connected", event)
    this.reconnectAttempts = 0
    this.reconnectInterval = 1000
    this.notifyReconnection()
  }

  private handleMessage(event: MessageEvent) {
    try {
      // Check if the message is empty
      if (!event.data) {
        console.warn("Received empty WebSocket message")
        return
      }

      // If the message is a string, try to parse it as JSON
      if (typeof event.data === "string") {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          if (this.isValidWebSocketMessage(message)) {
            this.notifySubscribers(message.type, message.payload)
          } else {
            console.warn("Received invalid WebSocket message format:", message)
          }
        } catch (jsonError) {
          // If JSON parsing fails, treat it as a plain text message
          console.log("Received plain text WebSocket message:", event.data)
          // You can add custom handling for plain text messages here if needed
        }
      } else {
        console.warn("Received non-string WebSocket message:", event.data)
      }
    } catch (error) {
      console.error("WebSocket message handling error:", error)
      console.error("Raw message data:", event.data)
    }
  }

  private handleClose(event: CloseEvent) {
    console.log("WebSocket Disconnected", event)
    if (!this.forcedClose) {
      this.scheduleReconnect()
    }
  }

  private handleError(error: Event) {
    console.error("WebSocket error:", error)
    if (error instanceof ErrorEvent) {
      console.error("Error message:", error.message)
    }
    if (this.ws) {
      console.error("WebSocket state:", this.getReadyStateString(this.ws.readyState))
    }
    this.scheduleReconnect()
  }

  private getReadyStateString(state: number): string {
    switch (state) {
      case WebSocket.CONNECTING:
        return "CONNECTING"
      case WebSocket.OPEN:
        return "OPEN"
      case WebSocket.CLOSING:
        return "CLOSING"
      case WebSocket.CLOSED:
        return "CLOSED"
      default:
        return "UNKNOWN"
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached. Please check your connection and refresh the page.")
      return
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      this.connect()
    }, this.reconnectInterval)

    // Exponential backoff with a maximum of 30 seconds
    this.reconnectInterval = Math.min(this.reconnectInterval * 2, 30000)
  }

  subscribe(type: string, callback: WebSocketCallback): () => void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set())
    }
    this.subscribers.get(type)?.add(callback)

    // If this is the first subscriber, ensure connection is established
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.connect()
    }

    return () => {
      this.subscribers.get(type)?.delete(callback)
    }
  }

  onReconnect(callback: ReconnectCallback): () => void {
    this.reconnectCallbacks.add(callback)
    return () => this.reconnectCallbacks.delete(callback)
  }

  private notifySubscribers(type: string, data: any) {
    this.subscribers.get(type)?.forEach((callback) => {
      try {
        callback(data)
      } catch (error) {
        console.error("Error in subscriber callback:", error)
      }
    })
  }

  private notifyReconnection() {
    this.reconnectCallbacks.forEach((callback) => {
      try {
        callback()
      } catch (error) {
        console.error("Error in reconnection callback:", error)
      }
    })
  }

  send(message: WebSocketMessage): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not connected. Message not sent:", message)
      return false
    }

    try {
      this.ws.send(JSON.stringify(message))
      return true
    } catch (error) {
      console.error("Error sending message:", error)
      return false
    }
  }

  forceReconnect() {
    this.forcedClose = false
    this.reconnectAttempts = 0
    this.reconnectInterval = 1000

    if (this.ws) {
      this.ws.close()
    }

    this.connect()
  }

  close() {
    this.forcedClose = true
    if (this.ws) {
      this.ws.close()
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  getState(): string {
    switch (this.ws?.readyState) {
      case WebSocket.CONNECTING:
        return "connecting"
      case WebSocket.OPEN:
        return "connected"
      case WebSocket.CLOSING:
        return "closing"
      case WebSocket.CLOSED:
        return "closed"
      default:
        return "not_initialized"
    }
  }

  private isValidWebSocketMessage(message: any): message is WebSocketMessage {
    return (
      typeof message === "object" &&
      message !== null &&
      typeof message.type === "string" &&
      ["PRODUCT_UPDATE", "PROMOTION_UPDATE", "STOCK_UPDATE", "NOTIFICATION"].includes(message.type) &&
      "payload" in message
    )
  }
}

export const websocketService = WebSocketService.getInstance()

