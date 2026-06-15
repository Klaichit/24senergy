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
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
        <img
          src={images[active]}
          alt={`${alt} ${active + 1}`}
          className="w-full h-full object-contain"
          style={{ filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.10))' }}
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
