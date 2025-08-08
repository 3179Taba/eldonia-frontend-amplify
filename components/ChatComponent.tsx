'use client'

import React, { useState, useEffect, useRef } from 'react'
import { chatClient, ChatMessage, ChatRoom } from '@/lib/supabase-chat'
import { useAuth } from '../app/lib/auth-context'

interface ChatComponentProps {
  roomName?: string
  onRoomChange?: (roomName: string) => void
}

export default function ChatComponent({ roomName = 'general', onRoomChange }: ChatComponentProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [currentRoom, setCurrentRoom] = useState(roomName)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  // メッセージ履歴を取得
  useEffect(() => {
    const loadMessages = async () => {
      const history = await chatClient.getMessageHistory(currentRoom)
      setMessages(history)
      scrollToBottom()
    }

    loadMessages()
  }, [currentRoom])

  // チャットルーム一覧を取得
  useEffect(() => {
    const loadRooms = async () => {
      const roomsList = await chatClient.getChatRooms()
      setRooms(roomsList)
    }

    loadRooms()
  }, [])

  // リアルタイムメッセージ受信
  useEffect(() => {
    if (!user) return

    // メッセージ受信コールバックを設定
    chatClient.onMessage((message) => {
      setMessages(prev => [...prev, message])
      scrollToBottom()
    })

    // チャットルームに参加
    const joinRoom = async () => {
      const success = await chatClient.joinRoom(currentRoom, user.id.toString())
      setIsConnected(success)
    }

    joinRoom()

    // クリーンアップ
    return () => {
      if (user) {
        chatClient.leaveRoom(currentRoom, user.id.toString())
      }
    }
  }, [currentRoom, user])

  // メッセージ送信
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    const messageData = {
      sender_id: user.id.toString(),
      content: newMessage,
      original_language: 'ja',
      target_language: 'ja',
      is_translated: false,
      room_name: currentRoom
    }

    const sentMessage = await chatClient.sendMessage(messageData)
    if (sentMessage) {
      setNewMessage('')
    }
  }

  // ルーム変更
  const handleRoomChange = async (roomName: string) => {
    if (!user) return

    // 現在のルームから離脱
    await chatClient.leaveRoom(currentRoom, user.id.toString())

    // 新しいルームに参加
    const success = await chatClient.joinRoom(roomName, user.id.toString())
    if (success) {
      setCurrentRoom(roomName)
      onRoomChange?.(roomName)
    }
  }

  // スクロールを最下部に
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">チャットに参加するにはログインしてください</p>
      </div>
    )
  }

  return (
    <div className="flex h-96 bg-white rounded-lg shadow-lg">
      {/* サイドバー - ルーム一覧 */}
      <div className="w-64 border-r border-gray-200 bg-gray-50">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">チャットルーム</h3>
          <div className="space-y-2">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => handleRoomChange(room.name)}
                className={`w-full text-left p-2 rounded ${
                  currentRoom === room.name
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{room.name}</div>
                {room.description && (
                  <div className="text-sm text-gray-500">{room.description}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* メイン - チャットエリア */}
      <div className="flex-1 flex flex-col">
        {/* ヘッダー */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">#{currentRoom}</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-sm text-gray-500">
              {isConnected ? '接続中' : '切断中'}
            </span>
          </div>
        </div>

        {/* メッセージエリア */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {message.sender_id.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">
                    {message.sender_id}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-800 mt-1">{message.content}</p>
                {message.translated_content && (
                  <p className="text-gray-600 text-sm mt-1 italic">
                    {message.translated_content}
                  </p>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* メッセージ入力 */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="メッセージを入力..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !isConnected}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              送信
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 