"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

const webSocketContext = createContext<any>(null)

export const WebSocketProvider = ({
  children,
  seller
}: {
  children: React.ReactNode;
  seller: any;
}) => {
  const [wsReady, setWsReady] = useState(false)
  const wsRef = useRef<WebSocket | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if(!seller?.id) return

    const ws = new WebSocket(process.env.NEXT_PUBLIC_CHATTING_WEBSOCKET_URI!)
    wsRef.current = ws

    ws.onopen = () => {
        ws.send(`seller_${seller.id}`)
        setWsReady(true)
    }

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data)

        if(data.type === "UNSEEN_COUNT_UPDATE"){
            const {conversationId, count} = data.payload
            setUnreadCounts((prev) => ({...prev, [conversationId]: count}))
        }
    }

    return () => {
        ws.close()
    }
  }, [seller?.id])

  if(!wsReady) return null

  return(
    <webSocketContext.Provider value={{ws: wsRef.current, unreadCounts}}>
        {children}
    </webSocketContext.Provider>
  )
};

export const useWebSocket = () => useContext(webSocketContext)