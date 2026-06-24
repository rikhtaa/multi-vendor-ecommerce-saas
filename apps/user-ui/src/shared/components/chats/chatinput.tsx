import { PickerProps } from "emoji-picker-react"
import { ImageIcon, Smile, Send } from "lucide-react" 
import dynamic from 'next/dynamic'
import React, { useState } from 'react'

const EmojiPicker = dynamic(
    () =>
        import("emoji-picker-react").then(
            (mod) => mod.default as React.FC<PickerProps>
        ),
    {
        ssr: false
    }
)

interface ChatInputProps {
    onSendMessage: (e: React.FormEvent) => void;
    message: string;
    setMessage: React.Dispatch<React.SetStateAction<string>>;
}

const ChatInput = ({
    onSendMessage,
    message,
    setMessage,
}: ChatInputProps) => { 
    const [showEmoji, setShowEmoji] = useState(false)

    const handleEmojiClick = (emojiData: any) => {
        setMessage((prev) => prev + emojiData.emoji)
        setShowEmoji(false)
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            console.log("Uploading image", file.name)
        }
    }

    return (
        <form
            onSubmit={onSendMessage}
            className="border-t border-t-gray-200 bg-white px-4 py-3 flex items-center gap-2 relative">
            
            {/* Upload Icon */}
            <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-md">
                <ImageIcon className="w-5 h-5 text-gray-600" />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    hidden
                />
            </label>

            {/* Emoji Picker Toggle */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setShowEmoji((prev) => !prev)}
                    className="p-2 hover:bg-gray-100 rounded-md"
                >
                    <Smile className="w-5 h-5 text-gray-600" />
                </button>
                {showEmoji && (
                    <div className="absolute bottom-12 left-0 z-50">
                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                )}
            </div>

            {/* Input Field */}
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 text-sm border outline-none border-gray-200 rounded"
            />
            
            <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 transition text-white p-2 rounded"
            >
                <Send className="w-4 h-4"/>
            </button>
        </form>
    )
}

export default ChatInput