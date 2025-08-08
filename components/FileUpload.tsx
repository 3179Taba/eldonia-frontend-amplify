'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, File, Image, Video, Music, FileText, CheckCircle } from 'lucide-react'
import { uploadToSupabase } from '../lib/supabase-storage'

interface FileUploadProps {
  onUploadComplete: (files: Array<{ id: string; file_url: string; file_type: string }>) => void
  accept?: string
  multiple?: boolean
  maxSize?: number // MB
  maxFiles?: number
  allowedTypes?: string[]
  bucket?: string
  folder?: string
}

interface FileItem {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
  uploadedFile?: {
    id: string
    file_url: string
    file_type: string
  }
}

export default function FileUpload({
  onUploadComplete,
  accept = '*/*',
  multiple = true,
  maxSize = 100, // 100MB
  maxFiles = 10,
  allowedTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf', 'text/*'],
  bucket = 'uploads',
  folder = 'posts'
}: FileUploadProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-6 h-6" />
    if (file.type.startsWith('video/')) return <Video className="w-6 h-6" />
    if (file.type.startsWith('audio/')) return <Music className="w-6 h-6" />
    if (file.type === 'application/pdf') return <FileText className="w-6 h-6" />
    return <File className="w-6 h-6" />
  }

  const validateFile = (file: File): string | null => {
    // サイズチェック
    if (file.size > maxSize * 1024 * 1024) {
      return `ファイルサイズが大きすぎます（最大${maxSize}MB）`
    }

    // タイプチェック
    const isValidType = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1))
      }
      return file.type === type
    })

    if (!isValidType) {
      return '対応していないファイル形式です'
    }

    return null
  }

  const handleFiles = useCallback((selectedFiles: FileList) => {
    const newFiles: FileItem[] = []

    Array.from(selectedFiles).forEach((file, index) => {
      const error = validateFile(file)

      if (error) {
        alert(error)
        return
      }

      const fileItem: FileItem = {
        id: `${Date.now()}-${index}`,
        file,
        progress: 0,
        status: 'uploading'
      }

      newFiles.push(fileItem)
    })

    if (files.length + newFiles.length > maxFiles) {
      alert(`ファイル数が多すぎます（最大${maxFiles}個）`)
      return
    }

    setFiles(prev => [...prev, ...newFiles])

    // アップロード開始
    newFiles.forEach(uploadFile)
  }, [files, maxFiles, allowedTypes, uploadFile, validateFile])

  const uploadFile = useCallback(async (fileItem: FileItem) => {
    try {
      const result = await uploadToSupabase(
        fileItem.file,
        bucket,
        folder,
        (progress) => {
          setFiles(prev =>
            prev.map(f =>
              f.id === fileItem.id
                ? { ...f, progress }
                : f
            )
          )
        }
      )

      setFiles(prev =>
        prev.map(f =>
          f.id === fileItem.id
            ? {
                ...f,
                status: 'success',
                progress: 100,
                uploadedFile: result
              }
            : f
        )
      )

      // 成功したファイルを親コンポーネントに通知
      const successFiles = [...files, { ...fileItem, status: 'success', uploadedFile: result }]
        .filter(f => f.status === 'success' && f.uploadedFile)
        .map(f => f.uploadedFile!)

      if (successFiles.length > 0) {
        onUploadComplete(successFiles)
      }

    } catch (error) {
      console.error('Upload error:', error)
      setFiles(prev =>
        prev.map(f =>
          f.id === fileItem.id
            ? {
                ...f,
                status: 'error',
                error: error instanceof Error ? error.message : 'アップロードに失敗しました'
              }
            : f
        )
      )
    }
  }, [files, bucket, folder, onUploadComplete])

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  return (
    <div className="w-full">
      {/* ドラッグ&ドロップエリア */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          ファイルをドラッグ&ドロップ
        </p>
        <p className="text-sm text-gray-500 mb-4">
          またはクリックしてファイルを選択
        </p>
        <p className="text-xs text-gray-400">
          対応形式: {allowedTypes.join(', ')} | 最大サイズ: {maxSize}MB | 最大ファイル数: {maxFiles}個
        </p>
      </div>

      {/* ファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        className="hidden"
      />

      {/* ファイルリスト */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((fileItem) => (
            <div
              key={fileItem.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(fileItem.file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileItem.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* プログレスバー */}
                {fileItem.status === 'uploading' && (
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${fileItem.progress}%` }}
                    />
                  </div>
                )}

                {/* ステータスアイコン */}
                {fileItem.status === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}

                {fileItem.status === 'error' && (
                  <div className="text-red-500 text-xs">
                    {fileItem.error}
                  </div>
                )}

                {/* 削除ボタン */}
                <button
                  onClick={() => removeFile(fileItem.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
