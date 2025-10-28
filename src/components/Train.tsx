import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import TrainImage from '../assets/vlak.png'
import { cn } from '../utils/cn'

type Props = {
  direction: 'lr' | 'rl'
  y: number
}

export const Train = ({ direction, y }: Props) => {
  const trainRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const train = trainRef.current

    if (!train) return

    const tl = gsap.timeline()

    gsap.set(train, {
      x: direction === 'lr' ? -200 : window.innerWidth + 200,
      y,
    })

    tl.to(train, {
      x: direction === 'lr' ? 100 : window.innerWidth - 100,
      duration: 2,
      ease: 'power2.out',
    })

    tl.to(train, {
      x: direction === 'lr' ? window.innerWidth + 200 : -200,
      duration: 20,
      ease: 'none',
    })

    let lastScrollTime = Date.now()
    let lastScrollY = window.scrollY
    let scrollSpeed = 0
    let speedTimeout: NodeJS.Timeout
    let speedTween: gsap.core.Tween | undefined

    const updateScrollSpeed = () => {
      const now = Date.now()
      const currentScrollY = window.scrollY
      const timeDiff = now - lastScrollTime
      const scrollDiff = Math.abs(currentScrollY - lastScrollY)

      if (timeDiff > 0) {
        scrollSpeed = scrollDiff / timeDiff
      }

      lastScrollTime = now
      lastScrollY = currentScrollY

      const targetSpeedMultiplier = Math.min(1 + scrollSpeed * 10, 5)

      if (speedTween) {
        speedTween.kill()
      }

      speedTween = gsap.to(tl, {
        timeScale: targetSpeedMultiplier,
        duration: 0.3,
        ease: 'power2.out',
      })

      clearTimeout(speedTimeout)

      speedTimeout = setTimeout(() => {
        if (speedTween) {
          speedTween.kill()
        }
        speedTween = gsap.to(tl, {
          timeScale: 1,
          duration: 0.5,
          ease: 'power2.out',
        })
      }, 200)
    }

    const handleScroll = () => {
      updateScrollSpeed()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    tl.eventCallback('onComplete', () => {
      gsap.set(train, { x: -200 })
      tl.restart()
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(speedTimeout)
      if (speedTween) speedTween.kill()
      tl.kill()
    }
  }, [])

  return (
    <img
      ref={trainRef}
      src={TrainImage.src}
      alt="Vlak"
      className={cn(
        'absolute top-1/2 transform -translate-y-1/2 w-80 h-auto',
        direction === 'rl' && '-scale-x-100',
      )}
    />
  )
}
