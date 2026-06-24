    "use client"
    import { useQuery, useQueryClient } from '@tanstack/react-query'
    import { useWebSocket } from 'apps/seller-ui/src/context/web-socket-context'
    import useSeller from 'apps/seller-ui/src/hooks/useSeller'
    import ChatInput from 'apps/seller-ui/src/shared/components/chats/chatinput'
    import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance'
    import Image from 'next/image'
    import { useSearchParams } from 'next/navigation'
    import { useRouter } from 'next/navigation'
    import React, { useEffect, useRef, useState } from 'react'

    const Page = () => {
        const searchParams = useSearchParams()
        const router = useRouter()
        const messageContainerRef = useRef<HTMLDivElement | null>(null)
        const scrollAnchorRef = useRef<HTMLDivElement | null>(null)
        const { seller, isLoading: userLoading } = useSeller()
        const conversationId = searchParams.get("conversationId");
        const { ws } = useWebSocket()
        const queryClient = useQueryClient()

        const [chats, setChats] = useState<any[]>([]);
        const [selectedChat, setSelectedChat] = useState<any | null>(null);
        const [message, setMessage] = useState("");

        const conversationIdRef = useRef<string | null>(null)
        conversationIdRef.current = conversationId  

        const { data: messages = [] } = useQuery({
            queryKey: ["messages", conversationId],
            queryFn: async () => {
                if (!conversationId ) return []
                const res = await axiosInstance.get(
                    `/chatting/api/get-seller-messages/${conversationId}?page=1`
                );
                return res.data.messages.reverse()
            },
            enabled: !!conversationId,
            staleTime: 0
        });

        useEffect(() => {
            if (!conversationId || messages.length === 0) return 
            const timeout = setTimeout(scrollToBottom, 100)
            return () => clearTimeout(timeout)
        }, [conversationId, messages.length]);

        useEffect(() => {
            if (!conversationId || chats.length > 0) {
                const chat = chats.find((c) => c.conversationId === conversationId);
                setSelectedChat(chat || null);
            }
        }, [conversationId, chats]);

        const scrollToBottom = () => {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    const container = messageContainerRef.current
                    if (container) {
                        container.scrollTop = container.scrollHeight
                    }
                }, 50)
            })
        }

        const { data: conversations, isLoading } = useQuery({
            queryKey: ["conversations"],
            queryFn: async () => {
                const res = await axiosInstance.get("/chatting/api/get-seller-conversations");
                return res.data.conversations;
            },
        });

        useEffect(() => {
            if (conversations) setChats(conversations)
        }, [conversations])

        useEffect(() => {
            if (!ws) return
            ws.onmessage = (event: any) => {
                const data = JSON.parse(event.data)
                if (data.type === "NEXT_MESSAGE") {
                    const newMsg = data?.payload
                     const currentId = conversationIdRef.current
                     if (String(newMsg.conversationId) === String(currentId)) {
                        queryClient.setQueryData(["messages", currentId], (old: any = []) => [
                            ...old,
                            {
                                content: newMsg.messageBody || newMsg.content || "",
                                senderType: newMsg.senderType,
                                seen: false,
                                createdAt: newMsg.createdAt || new Date().toISOString(),
                            }
                        ])
                        scrollToBottom()
                    }
                    setChats((prevChats) =>
                        prevChats.map((chat) =>
                            chat.conversationId === newMsg.conversationId
                                ? { ...chat, lastMessage: newMsg.content }
                                : chat
                        )
                    )
                }
                if (data.type === "UNSEEN_COUNT_UPDATE") {
                    const { conversationId: convId, count } = data.payload
                    setChats((prevChats) =>
                        prevChats.map((chat) =>
                            chat.conversationId === String(convId)
                                ? { ...chat, unreadCount: count }
                                : chat
                        )
                    )
                }
            }
        }, [ws, queryClient])

        const handleChatSelect = (chat: any) => {
            setChats((prev) =>
                prev.map((c) =>
                    c.conversationId === chat.conversationId ? { ...c, unreadCount: 0 } : c
                )
            );
            router.push(`?conversationId=${chat.conversationId}`);
            ws?.send(JSON.stringify({ type: "MARK_AS_SEEN", conversationId: chat.conversationId }))
        };

        const handleSend = async (e: any) => {
            e.preventDefault()
            if (!message.trim() || !selectedChat) return
            const payload = {
                fromUserId: seller?.id,
                toUserId: selectedChat?.user?.id,
                conversationId: selectedChat?.conversationId,
                messageBody: message,
                senderType: "seller",
            }
            ws?.send(JSON.stringify(payload))
        
            setChats((prevChats) =>
                prevChats.map((chat) =>
                    chat.conversationId === selectedChat.conversationId
                        ? { ...chat, lastMessage: payload.messageBody }
                        : chat
                )
            )
            setMessage("")
            scrollToBottom()
        }

        return (
            <div className="w-full h-screen bg-[#0f1117] flex items-center justify-center p-4">
                <div className="w-full max-w-5xl h-[85vh] flex rounded-xl overflow-hidden shadow-2xl border border-[#2a2d3a]">

                    {/* Sidebar */}
                    <div className="w-[280px] flex-shrink-0 bg-[#161822] flex flex-col border-r border-[#2a2d3a]">
                        <div className="px-5 py-4 border-b border-[#2a2d3a]">
                            <h2 className="text-white font-semibold text-base tracking-wide">Messages</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {isLoading ? (
                                <div className="p-4 text-sm text-gray-500">Loading...</div>
                            ) : chats.length === 0 ? (
                                <div className="p-4 text-sm text-gray-500">No conversations yet</div>
                            ) : (
                                chats.map((chat) => {
                                    const isActive = selectedChat?.conversationId === chat.conversationId;
                                    return (
                                        <button
                                            key={chat.conversationId}
                                            onClick={() => handleChatSelect(chat)}
                                            className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3
                                                ${isActive
                                                    ? "bg-[#5865f2]/20 border-l-2 border-[#5865f2]"
                                                    : "hover:bg-[#1e2030] border-l-2 border-transparent"
                                                }`}
                                        >
                                            <div className="relative flex-shrink-0">
                                                <Image
                                                    src={chat.user?.avatar || "https://plus.unsplash.com/premium_vector-1719858611039-66c134efa74d?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
                                                    alt={chat.user?.name || "User"}
                                                    width={36}
                                                    height={36}
                                                    className="rounded-full object-cover w-[38px] h-[38px]"
                                                />
                                                {chat.user?.isOnline && (
                                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#161822]" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-100 font-medium truncate">
                                                        {chat.user?.name || "User"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                                        {chat.lastMessage || ""}{" "}
                                                    </p>
                                                    {chat.unreadCount > 0 && (
                                                        <span className="ml-2 flex-shrink-0 bg-[#5865f2] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                            {chat.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    {/* Chat area */}
                    <div className="flex flex-col flex-1 bg-[#1a1c2e] min-w-0">
                        {selectedChat ? (
                            <>
                                {/* Chat header */}
                                <div className="px-5 py-3 border-b border-[#2a2d3a] bg-[#161822] flex items-center gap-3 flex-shrink-0">
                                    <div className="relative">
                                        <Image
                                            src={selectedChat.user?.avatar || "https://ik.imagekit.io/shahriarbecodemy/avatar/6_t8b5y8t3U.png"}
                                            alt={selectedChat?.user?.name || "Seller"}
                                            width={38}
                                            height={38}
                                            className="rounded-full object-cover w-[38px] h-[38px] border border-[#2a2d3a]"
                                        />
                                        {selectedChat.user?.isOnline && (
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#161822]" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-gray-100 font-semibold text-sm">{selectedChat.seller?.name}</h2>
                                        <p className="text-xs text-gray-500">
                                            {selectedChat.user?.isOnline ? (
                                                <span className="text-green-400">Online</span>
                                            ) : "Offline"}
                                        </p>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div
                                    ref={messageContainerRef}
                                    className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
                                >
                                    {/* {hasMore && (
                                        <div className="flex justify-center mb-3">
                                            <button
                                                onClick={loadMoreMessages}
                                                className="text-xs px-4 py-1.5 rounded-full bg-[#2a2d3a] text-gray-400 hover:bg-[#363952] hover:text-gray-200 transition-colors"
                                            >
                                                Load previous messages
                                            </button>
                                        </div>
                                    )} */}
                                    {messages?.map((msg: any, index: number) => (
                                        <div
                                            key={index}
                                            className={`flex flex-col ${msg.senderType === "seller" ? "items-end" : "items-start"}`}
                                        >
                                            <div className={`px-4 py-2 rounded-2xl text-sm max-w-[70%] shadow-sm
                                                ${msg.senderType === "seller"
                                                    ? "bg-[#5865f2] text-white rounded-br-sm"
                                                    : "bg-[#2a2d3a] text-gray-100 rounded-bl-sm"
                                                }`}
                                            >
                                                {msg.text || msg.content}
                                            </div>
                                            <span className="text-[10px] text-gray-600 mt-1 px-1">
                                                {msg.time || new Date(msg.createdAt).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })}
                                            </span>
                                        </div>
                                    ))}
                                    <div ref={scrollAnchorRef} />
                                </div>

                                {/* Input */}
                                <div className="flex-shrink-0 border-t border-[#2a2d3a]">
                                    <ChatInput
                                        message={message}
                                        setMessage={setMessage}
                                        onSendMessage={handleSend}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-2">
                                <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="opacity-30">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                <p className="text-sm">Select a conversation to start chatting</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    export default Page