'use client'
import { useRef, useEffect } from 'react'

interface Props {
  imageUrl: string | null
  children: React.ReactNode
}

export default function ParallaxSection({ imageUrl, children }: Props) {
  const bgRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!imageUrl) return
    const onScroll = () => {
      if (!bgRef.current || !sectionRef.current) return
      const { top } = sectionRef.current.getBoundingClientRect()
      bgRef.current.style.transform = `translateY(${-top * 0.25}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [imageUrl])

  return (
    <section ref={sectionRef} className="relative overflow-hidden border-t border-white/5" style={{ background: '#1a1a1f' }}>
      {imageUrl && (
        <div
          aria-hidden="true"
          ref={bgRef}
          style={{
            position: 'absolute', inset: '-25%',
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            opacity: 0.18,
            willChange: 'transform',
            filter: 'saturate(0.5) brightness(0.9)',
          }}
        />
      )}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(106,45,175,0.12) 0%, transparent 55%)', pointerEvents: 'none' }} />
      <div className="relative z-10">{children}</div>
    </section>
  )
}
