'use client'

import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  animationType?: 'fade' | 'slide' | 'zoom' | 'scale' | 'left' | 'right' | 'up'
}

export function useIntersectionObserver(options: UseIntersectionObserverOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    triggerOnce = false,
    animationType = 'fade'
  } = options

  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  const hasTriggered = useRef(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting
        
        if (isIntersecting && !hasTriggered.current) {
          // 要素が画面内に入った時
          setIsVisible(true)
          if (triggerOnce) {
            hasTriggered.current = true
          }
        } else if (!isIntersecting && !triggerOnce) {
          // 要素が画面外に出た時（triggerOnceがfalseの場合のみ）
          setIsVisible(false)
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, triggerOnce])

  // アニメーションクラスを動的に生成
  const getAnimationClasses = () => {
    const baseClasses = {
      fade: {
        hidden: 'fade-in-hidden',
        visible: 'fade-in-visible'
      },
      slide: {
        hidden: 'slide-in-hidden',
        visible: 'slide-in-visible'
      },
      zoom: {
        hidden: 'zoom-in-hidden',
        visible: 'zoom-in-visible'
      },
      scale: {
        hidden: 'scroll-hidden-scale',
        visible: 'scroll-visible-scale'
      },
      left: {
        hidden: 'scroll-hidden-left',
        visible: 'scroll-visible-left'
      },
      right: {
        hidden: 'scroll-hidden-right',
        visible: 'scroll-visible-right'
      },
      up: {
        hidden: 'scroll-hidden-up',
        visible: 'scroll-visible-up'
      }
    }

    const classes = baseClasses[animationType] || baseClasses.fade
    return isVisible ? classes.visible : classes.hidden
  }

  return { 
    elementRef, 
    isVisible, 
    animationClass: getAnimationClasses() 
  }
} 