'use client'
import { useState } from 'react'

interface Props {
  images: string[]
  alt: string
  accent: string
}

export default function ImageGallery({ images, alt, accent }: Props) {
  const [active, setActive] = useState(0)

  if (images.length === 0) return null

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main image */}
      <div className="relative w-full flex items-center justify-center" style={{ maxHeight: '420px' }}>
        {/* ambient glow — blurred copy behind the image */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${images[active]})`,
            backgroundSize: '55%', backgroundPosition: 'center 80%', backgroundRepeat: 'no-repeat',
            filter: 'blur(36px) saturate(2)',
            opacity: 0.45,
            transform: 'scale(1.1) translateY(14px)',
            pointerEvents: 'none',
          }}
        />
        <img
          src={images[active]}
          alt={`${alt} ${active + 1}`}
          className="w-full object-contain relative"
          style={{ maxHeight: '420px', zIndex: 1 }}
        />
        {/* ground shadow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', bottom: 8, left: '50%',
            transform: 'translateX(-50%)',
            width: '55%', height: 24,
            background: 'rgba(0,0,0,0.28)',
            filter: 'blur(18px)',
            borderRadius: '50%',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Thumbnails — only show if more than 1 image */}
      {images.length > 1 && (
        <div className="flex gap-3 flex-wrap">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0"
              style={{
                borderColor: active === i ? accent : 'transparent',
                opacity: active === i ? 1 : 0.55,
              }}
            >
              <img src={img} alt={`${alt} thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
