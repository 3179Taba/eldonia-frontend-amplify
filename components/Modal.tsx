'use client'

import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showLogo?: boolean
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showLogo = false
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl'
  }

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, closeOnEscape])

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnOverlayClick) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* オーバーレイ */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleOverlayClick}
        />

        {/* モーダル */}
        <div
          ref={modalRef}
          className={`relative bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} transform transition-all`}
        >
          {/* ヘッダー */}
          {(title || showCloseButton || showLogo) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {showLogo && (
                  <div className="relative w-8 h-8">
                    <Image
                      src="/images/icons/logo.png"
                      alt="Eldonia-Nex"
                      width={32}
                      height={32}
                      className="rounded-lg"
                    />
                  </div>
                )}
                {title && (
                  <h3 className="text-lg font-semibold text-gray-900">
                    {title}
                  </h3>
                )}
              </div>
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>
          )}

          {/* コンテンツ */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// 確認モーダル
interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '確認',
  cancelText = 'キャンセル',
  type = 'info'
}: ConfirmModalProps) {
  const getTypeColors = () => {
    switch (type) {
      case 'danger':
        return {
          button: 'bg-red-500 hover:bg-red-600',
          icon: 'text-red-500'
        }
      case 'warning':
        return {
          button: 'bg-yellow-500 hover:bg-yellow-600',
          icon: 'text-yellow-500'
        }
      default:
        return {
          button: 'bg-blue-500 hover:bg-blue-600',
          icon: 'text-blue-500'
        }
    }
  }

  const colors = getTypeColors()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center">
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${colors.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// アラートモーダル
interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info'
}: AlertModalProps) {
  const getTypeColors = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'text-green-500',
          bg: 'bg-green-50'
        }
      case 'error':
        return {
          icon: 'text-red-500',
          bg: 'bg-red-50'
        }
      case 'warning':
        return {
          icon: 'text-yellow-500',
          bg: 'bg-yellow-50'
        }
      default:
        return {
          icon: 'text-blue-500',
          bg: 'bg-blue-50'
        }
    }
  }

  const colors = getTypeColors()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${colors.bg} mb-4`}>
          <div className={`w-6 h-6 ${colors.icon}`}>
            {/* アイコンは必要に応じて追加 */}
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        <button
          onClick={onClose}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          閉じる
        </button>
      </div>
    </Modal>
  )
} 