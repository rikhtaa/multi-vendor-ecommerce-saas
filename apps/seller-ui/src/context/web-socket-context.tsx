"use client";
import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";

const webSocketContext = createContext<any>(null)

export const WebSocketProvider = ({ children, seller }: { children: React.ReactNode; seller: any }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null) // reactive, not just a ref
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const listenersRef = useRef<Set<(data: any) => void>>(new Set())

  useEffect(() => {
    if (!seller?.id) return
    const socket = new WebSocket(process.env.NEXT_PUBLIC_CHATTING_WEBSOCKET_URI!)
    wsRef.current = socket

    socket.onopen = () => {
      socket.send(`seller_${seller.id}`)
      setWs(socket) // triggers re-render with live socket
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === "UNSEEN_COUNT_UPDATE") {
        const { conversationId, count } = data.payload
        setUnreadCounts((prev) => ({ ...prev, [conversationId]: count }))
      }
      // fan out to all subscribers (Page included)
      listenersRef.current.forEach((fn) => fn(data))
    }

    return () => socket.close()
  }, [seller?.id])

  const subscribe = useCallback((fn: (data: any) => void) => {
    listenersRef.current.add(fn)
    return () => listenersRef.current.delete(fn)
  }, [])

  return (
    <webSocketContext.Provider value={{ ws, unreadCounts, subscribe }}>
      {children}
    </webSocketContext.Provider>
  )
};

export const useWebSocket = () => useContext(webSocketContext)