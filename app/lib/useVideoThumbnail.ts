import { useState, useRef, useEffect } from 'react'

interface UseVideoThumbnailProps {
  videoUrl: string
  onThumbnailGenerated?: (thumbnailUrl: string) => void
}

export const useVideoThumbnail = ({ videoUrl, onThumbnailGenerated }: UseVideoThumbnailProps) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateThumbnail = React.useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // ビデオの最初のフレームをキャプチャ
    video.currentTime = 0
    video.addEventListener('seeked', () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8)
      setThumbnailUrl(thumbnailDataUrl)
      onThumbnailGenerated?.(thumbnailDataUrl)
      setIsLoading(false)
    }, { once: true })
  }, [onThumbnailGenerated])

  useEffect(() => {
    if (videoUrl) {
      setIsLoading(true)
      generateThumbnail()
    }
  }, [videoUrl, generateThumbnail])

  return {
    thumbnailUrl,
    isLoading,
    videoRef,
    canvasRef,
    generateThumbnail
  }
}
