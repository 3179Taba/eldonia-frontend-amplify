'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Send, User, Globe, Settings, Users, MessageCircle, Plus, X } from 'lucide-react'
import { useI18n } from '../../lib/i18n-provider'
import { apiClient, ChatMessage, ChatRoom } from '../../lib/api'

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [currentRoom, setCurrentRoom] = useState('general')
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [showRooms, setShowRooms] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [settings, setSettings] = useState({
    originalLanguage: 'ja',
    targetLanguage: 'en',
    enableNotifications: true,
    enableSound: true,
    theme: 'dark'
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // WebSocket接続を確立
  const connectWebSocket = useCallback(() => {
    const wsUrl = `ws://localhost:8000/ws/chat/${currentRoom}/`
    console.log('WebSocket接続を試行中:', wsUrl)

    const newSocket = new WebSocket(wsUrl)

    newSocket.onopen = () => {
      console.log('WebSocket接続が確立されました')
      setIsConnected(true)
    }

    newSocket.onmessage = (event) => {
      console.log('WebSocketメッセージを受信:', event.data)
      const data = JSON.parse(event.data)
      handleWebSocketMessage(data)
    }

    newSocket.onclose = (event) => {
      console.log('WebSocket接続が切断されました:', event.code, event.reason)
      setIsConnected(false)
      // 再接続を試行
      setTimeout(() => {
        console.log('WebSocket再接続を試行中...')
        connectWebSocket()
      }, 3000)
    }

    newSocket.onerror = (error) => {
      console.error('WebSocketエラー:', error)
      setIsConnected(false)
    }

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [currentRoom, handleWebSocketMessage])

  // WebSocket接続を開始
  useEffect(() => {
    // connectWebSocketはクリーンアップ関数を返す
    return connectWebSocket()
  }, [connectWebSocket])

  // メッセージ履歴を取得
  const loadMessages = useCallback(async () => {
    try {
      const data = await apiClient.getChatMessages(currentRoom, 50)
      setMessages(data.messages)
    } catch (error) {
      console.error('メッセージの取得に失敗しました:', error)
    }
  }, [currentRoom])

  // ルーム一覧を取得
  const loadRooms = useCallback(async () => {
    try {
      const data = await apiClient.getChatRooms()
      setRooms(data.rooms)
    } catch (error) {
      console.error('ルーム一覧の取得に失敗しました:', error)
    }
  }, [])

  useEffect(() => {
    loadMessages()
    loadRooms()
  }, [loadMessages, loadRooms])

  const addSystemMessage = useCallback((text: string) => {
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      content: text,
      sender: 'system',
      original_language: 'ja',
      target_language: 'ja',
      is_translated: false,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, systemMessage])
  }, [])

  const playNotificationSound = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1)
  }, [])

  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'message':
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          content: data.message,
          sender: data.username,
          original_language: data.original_language,
          target_language: data.target_language,
          is_translated: data.is_translated || false,
          created_at: new Date().toISOString()
        }
        setMessages(prev => [...prev, newMessage])

        // 通知音を再生
        if (settings.enableSound) {
          playNotificationSound()
        }
        break

      case 'user_join':
        addSystemMessage(`${data.username}が参加しました`)
        break

      case 'user_leave':
        addSystemMessage(`${data.username}が退出しました`)
        break

      case 'typing':
        setTypingUsers(prev => {
          if (!prev.includes(data.username)) {
            return [...prev, data.username]
          }
          return prev
        })

        // 3秒後にタイピング表示を削除
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(user => user !== data.username))
        }, 3000)
        break
    }
  }, [settings.enableSound, addSystemMessage, playNotificationSound])

  const handleSendMessage = async () => {
    if (!inputText.trim() || !socket || !isConnected) return

    const messageData = {
      type: 'message',
      message: inputText,
      original_language: settings.originalLanguage,
      target_language: settings.targetLanguage
    }

    socket.send(JSON.stringify(messageData))
    setInputText('')
  }

  const handleTyping = () => {
    if (!socket || !isConnected) return

    // タイピング状態を送信
    socket.send(JSON.stringify({
      type: 'typing'
    }))

    // タイピングタイムアウトをリセット
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      // タイピング停止を送信（必要に応じて）
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    } else {
      handleTyping()
    }
  }

  const changeRoom = (roomName: string) => {
    setCurrentRoom(roomName)
    setMessages([])
    setShowRooms(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-900 via-cosmic-800 to-cosmic-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="section-title mb-4">
            🌟 Real-time Chat
          </h1>
          <p className="section-subtitle">
            Connect with fellow creators and get help from our community
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* サイドバー */}
          <div className="lg:col-span-1 space-y-4">
            {/* ルーム選択 */}
            <div className="cosmic-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Rooms</h3>
                <button
                  onClick={() => setShowRooms(!showRooms)}
                  className="text-white/70 hover:text-white"
                >
                  {showRooms ? <X size={20} /> : <Plus size={20} />}
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => changeRoom('general')}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentRoom === 'general'
                      ? 'bg-golden-400 text-cosmic-900'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle size={16} />
                    <span>General</span>
                  </div>
                </button>

                {rooms.map(room => (
                  <button
                    key={room.id}
                    onClick={() => changeRoom(room.name)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentRoom === room.name
                        ? 'bg-golden-400 text-cosmic-900'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle size={16} />
                        <span>{room.name}</span>
                      </div>
                      <span className="text-xs opacity-70">
                        {room.participant_count}/{room.max_participants}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 設定パネル */}
            <div className="cosmic-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Settings</h3>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white/70 hover:text-white"
                >
                  <Settings size={20} />
                </button>
              </div>

              {showSettings && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Original Language
                    </label>
                    <select
                      value={settings.originalLanguage}
                      onChange={(e) => setSettings(prev => ({ ...prev, originalLanguage: e.target.value }))}
                      className="w-full px-3 py-2 chat-select border border-white/20 rounded-lg text-white"
                    >
                      <option value="ja">🇯🇵 日本語</option>
                      <option value="en">🇺🇸 English</option>
                      <option value="zh">🇨🇳 中文</option>
                      <option value="ko">🇰🇷 한국어</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Target Language
                    </label>
                    <select
                      value={settings.targetLanguage}
                      onChange={(e) => setSettings(prev => ({ ...prev, targetLanguage: e.target.value }))}
                      className="w-full px-3 py-2 chat-select border border-white/20 rounded-lg text-white"
                    >
                      <option value="ja">日本語</option>
                      <option value="en">English</option>
                      <option value="zh">中文</option>
                      <option value="ko">한국어</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Sound Notifications</span>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, enableSound: !prev.enableSound }))}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.enableSound ? 'bg-golden-400' : 'bg-white/20'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.enableSound ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 接続状態 */}
            <div className="cosmic-card">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm text-white/70">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>

          {/* チャットメインエリア */}
          <div className="lg:col-span-3">
            <div className="cosmic-card h-[600px] flex flex-col">
              {/* メッセージエリア */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'system' ? 'justify-center' : 'justify-start'}`}
                  >
                    {message.sender === 'system' ? (
                      <div className="bg-white/10 text-white/70 rounded-lg px-4 py-2 text-sm">
                        {message.content}
                      </div>
                    ) : (
                      <div className="max-w-[70%]">
                        <div className="bg-white/10 text-white rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {message.sender_full_name || message.sender}
                            </span>
                            <span className="text-xs opacity-70">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{message.content}</p>
                          {message.is_translated && message.translated_content && (
                            <div className="border-t border-white/20 pt-2">
                              <p className="text-xs text-white/70 mb-1">Translation:</p>
                              <p className="text-sm text-golden-300">{message.translated_content}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* タイピング表示 */}
                {typingUsers.length > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 text-white rounded-lg p-4 max-w-[70%]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">
                          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* 入力エリア */}
              <div className="p-6 border-t border-white/20">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message here..."
                      className="w-full px-4 py-3 chat-input border border-white/20 rounded-lg text-white placeholder-white/50 resize-none"
                      rows={2}
                      disabled={!isConnected}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || !isConnected}
                    className="px-6 py-3 bg-golden-400 text-cosmic-900 rounded-lg hover:bg-golden-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-white/50">
                  <span>Press Enter to send, Shift+Enter for new line</span>
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    <span>{settings.originalLanguage} → {settings.targetLanguage}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Community Guidelines */}
        <div className="mt-8 cosmic-card">
          <h3 className="text-xl font-playfair font-bold mb-4 golden-text">Community Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">✅ Do&apos;s</h4>
              <ul className="space-y-1 text-white/80">
                <li>• Be respectful and supportive</li>
                <li>• Share your creative work</li>
                <li>• Ask questions and seek feedback</li>
                <li>• Collaborate with other creators</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">❌ Don&apos;ts</h4>
              <ul className="space-y-1 text-white/80">
                <li>• Spam or self-promote excessively</li>
                <li>• Use offensive language</li>
                <li>• Share inappropriate content</li>
                <li>• Harass other members</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
