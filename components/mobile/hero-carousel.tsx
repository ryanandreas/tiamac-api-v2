"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import type { Swiper as SwiperType } from "swiper"
import { Autoplay, EffectFade } from "swiper/modules"

// Import Swiper styles
import "swiper/css"
import "swiper/css/effect-fade"

const slides = [
  {
    src: "/images/mockiphone/screen1-portrait.png",
    alt: "Tiam AC Booking Flow"
  },
  {
    src: "/images/mockiphone/screen2-portrait.png",
    alt: "Tiam AC Login Screen"
  }
]

export function MobileHeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const swiperRef = useRef<SwiperType | null>(null)

  const handleDotClick = (index: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideToLoop(index)
    }
  }

  return (
    <div className="relative w-full max-w-[320px] md:max-w-[360px] mx-auto lg:ml-auto lg:mr-0 flex flex-col items-center">
      <div className="w-full">
        <Swiper
          modules={[Autoplay, EffectFade]}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          effect="fade"
          speed={1000}
          autoplay={{
            delay: 8000,
            disableOnInteraction: false,
          }}
          loop={true}
          grabCursor={true}
          onSlideChange={(swiper: SwiperType) => setActiveIndex(swiper.realIndex)}
          fadeEffect={{ crossFade: true }}
          className="relative z-20 w-full overflow-visible cursor-grab active:cursor-grabbing"
        >
          {slides.map((slide, i) => (
            <SwiperSlide key={i}>
              <div className="px-4 py-2 flex justify-center items-center">
                <Image 
                  src={slide.src} 
                  alt={slide.alt} 
                  width={500} 
                  height={1000}
                  className="w-full h-auto drop-shadow-none shadow-none pointer-events-none select-none"
                  priority={i === 0}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Manual Premium Accent Pagination Dots */}
      <div className="flex items-center gap-3 mt-8 relative z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => handleDotClick(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all duration-500 rounded-full h-2 ${
              activeIndex === i 
                ? "w-8 bg-[#66B21D]" 
                : "w-2 bg-slate-200 hover:bg-slate-300"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
