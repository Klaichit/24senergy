'use client'
import { useState } from 'react'
import Image from 'next/image'

interface Props {
  images: string[]
  alt: string
  accent: string
  heroMode?: boolean
}

export default function ImageGallery({ images, alt, accent, heroMode }: Props) {
  const [active, setActive] = useState(0)

  if (images.length === 0) return null

  if (heroMode) {
    return (
      <div className="flex flex-col gap-3 w-full">
        {/* Main image — no frame, crossfade */}
        <div className="relative w-full" style={{ height: '55vh', minHeight: 380, maxHeight: 640 }}>
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`${alt} ${i + 1}`}
              className="absolute inset-0 w-full h-full object-contain"
              style={{
                opacity: active === i ? 1 : 0,
                transition: 'opacity 0.65s ease-in-out',
                pointerEvents: active === i ? 'auto' : 'none',
              }}
            />
          ))}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2.5 flex-wrap">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 flex items-center justify-center"
                style={{
                  borderColor: active === i ? accent : 'rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(6px)',
                  opacity: active === i ? 1 : 0.55,
                  boxShadow: active === i ? `0 0 0 3px ${accent}33` : 'none',
                }}
              >
                <img src={img} alt={`${alt} ${i + 1}`} className="w-full h-full object-contain p-1" />
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main image — framed container */}
      <div
        className="relative w-full rounded-3xl overflow-hidden"
        style={{
          height: '560px',
          background: 'linear-gradient(145deg, #f8f8fc 0%, #f2f2f8 100%)',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: `0 2px 12px rgba(0,0,0,0.04), 0 16px 48px rgba(0,0,0,0.07), 0 0 0 1px rgba(255,255,255,0.8) inset`,
        }}
      >
        {/* ambient glow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: '-10%',
            backgroundImage: `url(${images[active]})`,
            backgroundSize: '65%', backgroundPosition: 'center 70%', backgroundRepeat: 'no-repeat',
            filter: 'blur(48px) saturate(2.5)',
            opacity: 0.55,
            transform: 'scale(1.05) translateY(10px)',
            pointerEvents: 'none',
          }}
        />
        {/* accent glow ring */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse at 50% 85%, ${accent}18 0%, transparent 65%)`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <Image
          src={images[active]}
          alt={`${alt} ${active + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 480px"
          className="object-contain"
          style={{ zIndex: 1, padding: '24px' }}
          priority={active === 0}
        />
        {/* ground shadow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', bottom: 16, left: '50%',
            transform: 'translateX(-50%)',
            width: '50%', height: 28,
            background: 'rgba(0,0,0,0.22)',
            filter: 'blur(20px)',
            borderRadius: '50%',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Thumbnails — object-contain, no crop */}
      {images.length > 1 && (
        <div className="flex gap-2.5 flex-wrap">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 flex items-center justify-center"
              style={{
                borderColor: active === i ? accent : 'rgba(0,0,0,0.08)',
                background: '#f8f8fc',
                opacity: active === i ? 1 : 0.6,
                boxShadow: active === i ? `0 0 0 3px ${accent}22` : 'none',
              }}
            >
              <img src={img} alt={`${alt} ${i + 1}`} className="w-full h-full object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
