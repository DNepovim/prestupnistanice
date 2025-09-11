import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TrainImage from '../assets/vlak.png';

export default function Trains() {
  const trainRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const train = trainRef.current;
    const trainContainer = containerRef.current;

    if (!train || !trainContainer) return;

    const tl = gsap.timeline();

    gsap.set(train, { x: -200 });

    tl.to(train, {
      x: 100, // Stop at viewport edge
      duration: 2,
      ease: "power2.out",
    });

    tl.to(train, {
      x: window.innerWidth + 200,
      duration: 20,
      ease: "none",
    });

    let lastScrollTime = Date.now();
    let lastScrollY = window.scrollY;
    let scrollSpeed = 0;
    let speedTimeout: NodeJS.Timeout;
    let speedTween: gsap.core.Tween;

    let parallaxTween: gsap.core.Tween;
    let parallaxTimeout: NodeJS.Timeout;

    // Track scroll speed
    const updateScrollSpeed = () => {
      const now = Date.now();
      const currentScrollY = window.scrollY;
      const timeDiff = now - lastScrollTime;
      const scrollDiff = Math.abs(currentScrollY - lastScrollY);

      if (timeDiff > 0) {
        scrollSpeed = scrollDiff / timeDiff; // pixels per millisecond
      }

      lastScrollTime = now;
      lastScrollY = currentScrollY;

      // Calculate target speed multiplier (1 = normal speed, up to 5x faster)
      const targetSpeedMultiplier = Math.min(1 + scrollSpeed * 10, 5);

      // Kill existing speed tween
      if (speedTween) {
        speedTween.kill();
      }

      // Animate to new speed smoothly
      speedTween = gsap.to(tl, {
        timeScale: targetSpeedMultiplier,
        duration: 0.3,
        ease: "power2.out",
      });

      // Clear existing timeout
      clearTimeout(speedTimeout);

      // Reset to normal speed after 200ms of no scrolling
      speedTimeout = setTimeout(() => {
        if (speedTween) {
          speedTween.kill();
        }
        speedTween = gsap.to(tl, {
          timeScale: 1,
          duration: 0.5,
          ease: "power2.out",
        });
      }, 200);
    };

    // Smooth parallax effect for train container
    const updateParallax = () => {
      const scrollY = window.scrollY;
      const targetParallaxOffset = -scrollY * 0.3; // Negative value for opposite direction

      // Kill existing parallax tween
      if (parallaxTween) {
        parallaxTween.kill();
      }

      // Animate to new parallax position smoothly
      parallaxTween = gsap.to(trainContainer, {
        y: targetParallaxOffset,
        duration: 0.2,
        ease: "power2.out",
      });

      // Clear existing timeout
      clearTimeout(parallaxTimeout);

      // Reset parallax after 100ms of no scrolling
      parallaxTimeout = setTimeout(() => {
        if (parallaxTween) {
          parallaxTween.kill();
        }
        parallaxTween = gsap.to(trainContainer, {
          y: -scrollY * 0.3,
          duration: 0.4,
          ease: "power2.out",
        });
      }, 100);
    };

    // Listen for scroll events
    const handleScroll = () => {
      updateScrollSpeed();
      updateParallax();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Reset animation when it reaches the end
    tl.eventCallback("onComplete", () => {
      gsap.set(train, { x: -200 });
      tl.restart();
    });

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(speedTimeout);
      clearTimeout(parallaxTimeout);
      if (speedTween) speedTween.kill();
      if (parallaxTween) parallaxTween.kill();
      tl.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10 opacity-20"
    >
      <img
        ref={trainRef}
        src={TrainImage.src}
        alt="Vlak"
        className="absolute top-1/2 transform -translate-y-1/2 w-80 h-auto"
        style={{ left: '-200px' }}
      />
    </div>
  );
}
