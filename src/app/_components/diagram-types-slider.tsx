"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { type DiagramType } from "@/constants/diagram-types";
import "swiper/css";
import "swiper/css/effect-cards";

interface DiagramTypesSliderProps {
  diagrams: DiagramType[];
}

export function DiagramTypesSlider({ diagrams }: DiagramTypesSliderProps) {
  return (
    <div className="relative w-full">
      <Swiper
        effect={"cards"}
        grabCursor={true}
        modules={[EffectCards]}
        className="h-[300px] w-[240px] sm:h-[380px] sm:w-[280px]"
      >
        {diagrams.map((diagram) => (
          <SwiperSlide
            key={diagram.name}
            className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-lg sm:p-6"
          >
            {/* ... rest of the component code ... */}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
