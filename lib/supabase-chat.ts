import { supabase } from './supabaseClient'
import { RealtimeChannel } from '@supabase/supabase-js'

// 共通のSupabaseクライアントを再エクスポート
export { supabase }

// チャットメッセージの型定義
export interface ChatMessage {
  id: string
  sender_id: string
  content: string
  translated_content?: string
  original_language: string
  target_language: string
  is_translated: boolean
  room_name: string
  created_at: string
  updated_at: string
}

// チャットルームの型定義
export interface ChatRoom {
  id: string
  name: string
  description?: string
  is_public: boolean
  max_participants: number
  created_by_id: string
  created_at: string
  updated_at: string
}

// チャット機能クラス
export class SupabaseChat {
  private channel: RealtimeChannel | null = null
  private messageCallbacks: ((message: ChatMessage) => void)[] = []

  // チャットルームに参加
  async joinRoom(roomName: string, userId: string) {
    try {
      // チャットルーム参加者として追加
      const { error } = await supabase
        .from('chat_room_participants')
        .insert({
          room_id: roomName,
          user_id: userId
        })

      if (error) {
        console.error('ルーム参加エラー:', error)
        return false
      }

      // リアルタイムチャンネルに参加
      this.channel = supabase
        .channel(`chat:${roomName}`)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'chat_messages',
            filter: `room_name=eq.${roomName}`
          }, 
          (payload) => {
            const message = payload.new as ChatMessage
            this.messageCallbacks.forEach(callback => callback(message))
          }
        )
        .subscribe()

      return true
    } catch (error) {
      console.error('チャットルーム参加エラー:', error)
      return false
    }
  }

  // メッセージを送信
  async sendMessage(message: Omit<ChatMessage, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(message)
        .select()
        .single()

      if (error) {
        console.error('メッセージ送信エラー:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('メッセージ送信エラー:', error)
      return null
    }
  }

  // メッセージを受信
  onMessage(callback: (message: ChatMessage) => void) {
    this.messageCallbacks.push(callback)
  }

  // チャットルームを離脱
  async leaveRoom(roomName: string, userId: string) {
    try {
      // リアルタイムチャンネルから離脱
      if (this.channel) {
        await this.channel.unsubscribe()
        this.channel = null
      }

      // 参加者リストから削除
      const { error } = await supabase
        .from('chat_room_participants')
        .delete()
        .eq('room_id', roomName)
        .eq('user_id', userId)

      if (error) {
        console.error('ルーム離脱エラー:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('チャットルーム離脱エラー:', error)
      return false
    }
  }

  // メッセージ履歴を取得
  async getMessageHistory(roomName: string, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_name', roomName)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('メッセージ履歴取得エラー:', error)
        return []
      }

      return data.reverse()
    } catch (error) {
      console.error('メッセージ履歴取得エラー:', error)
      return []
    }
  }

  // チャットルーム一覧を取得
  async getChatRooms() {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('チャットルーム取得エラー:', error)
        return []
      }

      return data
    } catch (error) {
      console.error('チャットルーム取得エラー:', error)
      return []
    }
  }

  // チャットルームを作成
  async createChatRoom(room: Omit<ChatRoom, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .insert(room)
        .select()
        .single()

      if (error) {
        console.error('チャットルーム作成エラー:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('チャットルーム作成エラー:', error)
      return null
    }
  }
}

// グローバルチャットインスタンス
export const chatClient = new SupabaseChat() 