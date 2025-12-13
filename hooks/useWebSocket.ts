import { useEffect, useRef, useState } from "react"
import { BrowserInstance, checkIsExtension, WS_URL } from "../utils"
import { useAppContext } from "../context/AppContext"
import { useOnlineStatus } from "./useOnlineStatus"

// websocketManager.ts
type Handler<T> = (data: T) => void

type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting"

class WebSocketManager {
  private connectCallbacks: (() => void)[] = []
  private ws: WebSocket | null = null
  private handlers: Handler<any>[] = []
  private static instance: WebSocketManager | null = null
  private currentUrl: string | null = null
  private isConnecting: boolean = false
  private connectionState: ConnectionState = "disconnected"
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectInterval = 1000 // Start with 1 second
  private heartbeatInterval: NodeJS.Timeout | null = null
  private reconnectTimeout: NodeJS.Timeout | null = null
  private lastPingTime: number = 0
  private connectionLostCallbacks: (() => void)[] = []
  private connectionRestoredCallbacks: (() => void)[] = []

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager()
    }
    return WebSocketManager.instance
  }

  private openCallbacks: (() => void)[] = []
  private reconnectingCallbacks: (() => void)[] = []

  onOpen(callback: () => void) {
    this.openCallbacks.push(callback)
    return () => {
      this.openCallbacks = this.openCallbacks.filter((cb) => cb !== callback)
    }
  }

  onReconnecting(callback: () => void) {
    this.reconnectingCallbacks.push(callback)
    return () => {
      this.reconnectingCallbacks = this.reconnectingCallbacks.filter(
        (cb) => cb !== callback,
      )
    }
  }

  private handleReconnecting() {
    this.connectionState = "reconnecting"
    this.reconnectingCallbacks.forEach((cb) => cb())
  }

  async connect(
    url?: string,
    {
      onConnect,
      onReconnect,
      onConnectionLost,
      onConnectionRestored,
    }: {
      onConnect?: () => void
      onReconnect?: () => void
      onConnectionLost?: () => void
      onConnectionRestored?: () => void
    } = {},
  ) {
    const targetUrl = url || this.currentUrl
    if (!targetUrl) return

    // If already connected to same URL, just register callbacks and return
    if (
      this.ws?.readyState === WebSocket.OPEN &&
      this.currentUrl === targetUrl
    ) {
      console.log("✅ Already connected, skipping connection")
      onConnect && this.connectCallbacks.push(onConnect)
      onReconnect && this.reconnectingCallbacks.push(onReconnect)
      onConnectionLost && this.connectionLostCallbacks.push(onConnectionLost)
      onConnectionRestored &&
        this.connectionRestoredCallbacks.push(onConnectionRestored)
      return
    }

    // Prevent multiple simultaneous connections
    if (this.isConnecting) {
      console.log("⏳ Connection already in progress, skipping")
      return
    }

    // Set connecting flag IMMEDIATELY to prevent race conditions
    this.isConnecting = true

    // Add timeout to prevent hanging in connecting state
    const connectionTimeout = setTimeout(() => {
      if (this.isConnecting) {
        console.log("⏰ Connection timeout, resetting isConnecting flag")
        this.isConnecting = false
        this.ws?.close()
      }
    }, 10000) // 10 second timeout

    // Close existing connection if URL changed
    if (this.ws && this.currentUrl !== targetUrl) {
      console.log("🚀 Closing existing WebSocket for reconnection")
      await this.close()
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      clearTimeout(connectionTimeout)
      this.isConnecting = false
      return
    }
    this.connectionState =
      this.reconnectAttempts > 0 ? "reconnecting" : "connecting"
    this.currentUrl = targetUrl

    try {
      this.ws = new WebSocket(targetUrl)

      this.ws.onopen = () => {
        console.log("✅ WebSocket opened successfully")
        clearTimeout(connectionTimeout)
        this.isConnecting = false
        this.connectionState = "connected"
        this.reconnectAttempts = 0
        this.reconnectInterval = 1000 // Reset interval
        this.connectionRestoredCallbacks.forEach((cb) => cb())

        // Start heartbeat
        this.startHeartbeat()

        // Notify callbacks
        this.connectCallbacks.forEach((cb) => cb())

        this.connectCallbacks = []

        // Notify connection restored if this was a reconnection
        if (this.reconnectAttempts > 0) {
          this.connectionRestoredCallbacks.forEach((cb) => cb())
        }
      }

      this.ws.onmessage = (event) => {
        let data
        try {
          data = JSON.parse(event.data)
        } catch (e) {
          return
        }

        // Handle pong responses
        if (data.type === "pong") {
          console.log("📡 Received pong, connection alive")
          return
        }

        // // Send acknowledgment if message has messageId (for E2E testing)
        // if (data.messageId) {
        //   console.log(`📨 Sending ACK for message ${data.messageId}`)
        //   this.send({
        //     type: "ack",
        //     messageId: data.messageId,
        //   })
        // }

        this.handlers.forEach((handler) => handler(data))
      }

      this.ws.onclose = (event) => {
        console.log("🔌 WebSocket closed", event.code, event.reason)
        clearTimeout(connectionTimeout)
        this.ws = null
        this.isConnecting = false
        this.connectionState = "disconnected"

        // Stop heartbeat
        this.stopHeartbeat()

        // Only attempt reconnection if it wasn't a clean close
        if (!event.wasClean && event.code !== 1000) {
          console.log(
            "Connection lost unexpectedly, attempting reconnection...",
          )
          this.connectionLostCallbacks.forEach((cb) => cb())
          this.reconnect()
        } else {
          // Clean close - reset everything
          this.currentUrl = null
          this.reconnectAttempts = 0
        }
      }

      this.ws.onerror = this.handleError.bind(this)
    } catch (error) {
      console.error("Failed to create WebSocket:", error)
      clearTimeout(connectionTimeout)
      this.isConnecting = false
      this.connectionState = "disconnected"
      this.reconnect()
    }
  }

  private reconnect() {
    // Ensure we're not in connecting state before reconnecting
    this.isConnecting = false

    this.handleReconnecting()
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(
        this.reconnectInterval * this.reconnectAttempts,
        30000,
      )
      console.log(
        `🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      )

      this.reconnectTimeout = setTimeout(() => {
        this.connect()
      }, delay)
    } else {
      console.error("❌ Max reconnection attempts reached")
      this.connectionLostCallbacks.forEach((cb) => cb())
    }
  }

  private pongTimeout: any | null = null

  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.lastPingTime = Date.now()
        this.send({ type: "ping" })

        if (this.pongTimeout) clearTimeout(this.pongTimeout)
        this.pongTimeout = setTimeout(() => {
          console.log("❌ Pong not received, closing socket")
          this.ws?.close()
        }, 30000)
      }
    }, 25000) as unknown as NodeJS.Timeout
  }

  private handleError(error: Event) {
    this.isConnecting = false
    this.connectionState = "disconnected"

    // Only attempt to reconnect if we haven't exceeded max attempts
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      console.log("🔄 Attempting to reconnect...")
      this.reconnect()
    } else {
      console.error("Max reconnection attempts reached")
      this.connectionLostCallbacks.forEach((cb) => cb())
    }
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  subscribe<T>(handler: Handler<T>) {
    this.handlers.push(handler)
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler)
    }
  }

  onConnectionLost(callback: () => void) {
    this.connectionLostCallbacks.push(callback)
    return () => {
      this.connectionLostCallbacks = this.connectionLostCallbacks.filter(
        (cb) => cb !== callback,
      )
    }
  }

  onConnectionRestored(callback: () => void) {
    this.connectionRestoredCallbacks.push(callback)
    return () => {
      this.connectionRestoredCallbacks =
        this.connectionRestoredCallbacks.filter((cb) => cb !== callback)
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  getConnectionState(): ConnectionState {
    return this.connectionState
  }

  send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
      return true
    } else {
      console.log("Cannot send message: WebSocket not connected")
      return false
    }
  }

  notifyTyping({
    threadId,
    isTyping,
    userId,
    guestId,
  }: {
    threadId: string
    isTyping: boolean
    userId?: string
    guestId?: string
  }) {
    this.send({
      type: "typing",
      threadId,
      isTyping,
      userId,
      guestId,
    })
  }

  notifyPresence({
    threadId,
    isOnline,
  }: {
    threadId?: string
    isOnline: boolean
    userId?: string
  }) {
    this.send({
      type: "presence",
      threadId,
      isOnline,
    })
  }

  // Force reconnection manually
  forceReconnect() {
    console.log("🔄 Forcing reconnection...")
    this.reconnectAttempts = 0
    this.ws?.close()
  }

  async close(): Promise<void> {
    // Stop heartbeat and reconnection attempts
    this.stopHeartbeat()
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.ws) {
      return new Promise((resolve) => {
        if (!this.ws) {
          resolve()
          return
        }

        // If already closing/closed, resolve immediately
        if (
          this.ws.readyState === WebSocket.CLOSING ||
          this.ws.readyState === WebSocket.CLOSED
        ) {
          this.ws = null
          this.currentUrl = null
          this.isConnecting = false
          this.connectionState = "disconnected"
          resolve()
          return
        }

        // Set up one-time close handler
        const onClose = () => {
          console.log("🔌 WebSocket close confirmed")
          this.ws = null
          this.currentUrl = null
          this.isConnecting = false
          this.connectionState = "disconnected"
          resolve()
        }

        this.ws.addEventListener("close", onClose, { once: true })
        this.ws.close()
      })
    }
  }
}

export const useWebSocket = <T extends { type: string }>({
  token,
  onMessage,
  deviceId,
  deps,
}: {
  token?: string
  onMessage: (data: T) => void
  deps?: any[]
  deviceId?: string
}) => {
  const isOnline = useOnlineStatus()
  const wsManager = WebSocketManager.getInstance()

  const connectionStateRef = useRef<ConnectionState>("disconnected")
  const [connected, setConnected] = useState<boolean>(false)

  useEffect(() => {
    const handleOnline = () => {
      if (!wsManager?.isConnected()) {
        wsManager?.forceReconnect()
      }
    }

    isOnline && handleOnline()
  }, [wsManager, isOnline])

  useEffect(() => {
    if (!wsManager) return

    const checkConnection = setInterval(() => {
      const currentState = wsManager.getConnectionState()
      const isCurrentlyConnected = wsManager.isConnected()

      if (currentState !== connectionStateRef.current) {
        connectionStateRef.current = currentState

        // Only update state if connection status actually changed
        setConnected((prev) => {
          if (prev !== isCurrentlyConnected) {
            return isCurrentlyConnected
          }
          return prev
        })
      }
    }, 3000)

    return () => clearInterval(checkConnection)
  }, [wsManager])

  useEffect(() => {
    if (!token || !wsManager || !deviceId) {
      return
    }
    if (deps && deps?.some((dep) => dep === undefined)) {
      return
    }

    const base = WS_URL
    const wsUrl = `${base}?token=${encodeURIComponent(token)}&deviceId=${encodeURIComponent(deviceId)}`

    wsManager.connect(wsUrl, {
      onConnect: () => {
        setConnected(true)
      },
      onReconnect: () => {
        setConnected(true)
      },
      onConnectionLost: () => {
        setConnected(false)
      },
      onConnectionRestored: () => {
        setConnected(true)
      },
    })

    // Monitor connection state
  }, [token, deps, wsManager, deviceId])

  // Use ref to avoid re-subscribing on every onMessage change
  const onMessageRef = useRef(onMessage)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    if (!wsManager) return

    // Wrap in stable function that uses ref
    const stableHandler = (data: T) => onMessageRef.current(data)

    return wsManager.subscribe<T>(stableHandler)
  }, [wsManager])

  return {
    connected,
    send: wsManager?.send.bind(wsManager),
    subscribe: wsManager?.subscribe.bind(wsManager),
    isConnected: wsManager?.isConnected.bind(wsManager),
    getConnectionState: wsManager?.getConnectionState.bind(wsManager),
    notifyPresence: wsManager?.notifyPresence.bind(wsManager),
    notifyTyping: wsManager?.notifyTyping.bind(wsManager),
    forceReconnect: wsManager?.forceReconnect.bind(wsManager),
    onConnectionLost: wsManager?.onConnectionLost.bind(wsManager),
    onConnectionRestored: wsManager?.onConnectionRestored.bind(wsManager),
  }
}

export { WebSocketManager }
