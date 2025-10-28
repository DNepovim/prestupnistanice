import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { Train } from './Train'

type TrainState = {
  id: number
  direction: 'rl' | 'lr'
  y: number
}

export default function Trains() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [trains, setTrains] = useState<TrainState[]>([])
  const trainIdCounter = useRef(0)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const trainContainer = containerRef.current

    if (!trainContainer) return

    let speedTween: gsap.core.Tween | undefined
    let parallaxTween: gsap.core.Tween | undefined
    let parallaxTimeout: NodeJS.Timeout
    let trainSpawnInterval: NodeJS.Timeout

    const updateParallax = () => {
      const scrollY = window.scrollY
      const targetParallaxOffset = -scrollY * 0.3

      if (parallaxTween) {
        parallaxTween.kill()
      }

      parallaxTween = gsap.to(trainContainer, {
        y: targetParallaxOffset,
        duration: 0.2,
        ease: 'power2.out',
      })

      clearTimeout(parallaxTimeout)

      parallaxTimeout = setTimeout(() => {
        if (parallaxTween) {
          parallaxTween.kill()
        }
        parallaxTween = gsap.to(trainContainer, {
          y: -scrollY * 0.3,
          duration: 0.4,
          ease: 'power2.out',
        })
      }, 100)
    }

    // Function to spawn new trains
    const spawnTrain = () => {
      const newTrain: TrainState = {
        id: trainIdCounter.current++,
        direction: Math.random() < 0.5 ? 'rl' : 'lr',
        y: Math.random() * (window.innerHeight - 100) + 50, // Random between 50 and window height - 50
      }

      setTrains((prevTrains) => [...prevTrains, newTrain])

      // Remove train after animation completes (adjust duration based on your train animation)
      setTimeout(() => {
        // todo refactor
        // eslint-disable-next-line sonarjs/no-nested-functions
        setTrains((prevTrains) => prevTrains.filter((train) => train.id !== newTrain.id))
      }, 15000) // Remove after 15 seconds (adjust based on your animation duration)
    }

    // Set up train spawning interval
    const scheduleNextSpawn = () => {
      const delay = Math.random() * 1000 + 2000 // Random delay between 2-3 seconds
      trainSpawnInterval = setTimeout(() => {
        spawnTrain()
        scheduleNextSpawn() // Schedule next spawn
      }, delay)
    }

    // Start spawning trains
    scheduleNextSpawn()

    window.addEventListener('scroll', updateParallax, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateParallax)
      clearTimeout(parallaxTimeout)
      clearTimeout(trainSpawnInterval)
      if (speedTween) speedTween.kill()
      if (parallaxTween) parallaxTween.kill()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10 opacity-20"
    >
      {trains.map((train) => (
        <Train key={train.id} direction={train.direction} y={train.y} />
      ))}
    </div>
  )
}
