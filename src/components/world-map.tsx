import { useRef } from "react"
import type { Experience } from "@/lib/experience-data"

interface WorldMapProps {
  experiences: Experience[]
  selectedExperience: Experience | null
  onSelectExperience: (exp: Experience | null) => void
}

export function WorldMap({ experiences, selectedExperience, onSelectExperience }: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <div className="relative w-full h-auto">
        <img src="/map.svg" alt="Карта мира" className="w-full h-auto" />
      </div>
    </div>
  )
}
