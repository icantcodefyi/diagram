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
            <div className="flex h-full flex-col">
              <h4 className="mb-2 text-base font-semibold text-gray-900 sm:text-lg">
                {diagram.name}
              </h4>
              <p className="mb-3 text-xs text-gray-500 sm:mb-4 sm:text-sm">
                Create stunning {diagram.name.toLowerCase()} with ease
              </p>
              <div className="relative flex-1">
                <Image
                  src={diagram.image}
                  alt={diagram.name}
                  fill
                  className="object-contain p-2 transition-all duration-300 group-hover:scale-105 sm:p-3"
                />
              </div>
              <Badge
                variant="secondary"
                className="mt-3 justify-center bg-gray-100 py-1 text-xs font-medium text-gray-900 sm:mt-4 sm:py-1.5 sm:text-sm"
              >
                View Example
              </Badge>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
