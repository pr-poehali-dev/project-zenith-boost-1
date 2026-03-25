import { useEffect, useRef, useState } from "react"
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet"
import Icon from "@/components/ui/icon"

export interface TreeMarker {
  id: string
  lat: number
  lng: number
  name: string
  species: string
  diameter: number
  count: number
  height: number
  photo?: string
  note?: string
}

interface TreeMapProps {
  markers: TreeMarker[]
  onAddMarker: (lat: number, lng: number) => void
  onSelectMarker: (marker: TreeMarker) => void
  selectedId?: string
}

export function TreeMap({ markers, onAddMarker, onSelectMarker, selectedId }: TreeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<Map<string, LeafletMarker>>(new Map())
  const [isAddMode, setIsAddMode] = useState(false)

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return

    const initMap = async () => {
      const L = (await import("leaflet")).default
      await import("leaflet/dist/leaflet.css")

      const map = L.map(mapRef.current!, {
        center: [55.751244, 37.618423],
        zoom: 13,
        zoomControl: false,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map)

      L.control.zoom({ position: "bottomright" }).addTo(map)

      map.on("click", (e) => {
        if (isAddModeRef.current) {
          onAddMarker(e.latlng.lat, e.latlng.lng)
          isAddModeRef.current = false
          setIsAddMode(false)
        }
      })

      leafletMapRef.current = map
    }

    initMap()

    return () => {
      leafletMapRef.current?.remove()
      leafletMapRef.current = null
    }
  }, [])

  const isAddModeRef = useRef(false)

  useEffect(() => {
    isAddModeRef.current = isAddMode
  }, [isAddMode])

  useEffect(() => {
    if (!leafletMapRef.current) return

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default

      const existingIds = new Set(markersRef.current.keys())
      const currentIds = new Set(markers.map((m) => m.id))

      existingIds.forEach((id) => {
        if (!currentIds.has(id)) {
          markersRef.current.get(id)?.remove()
          markersRef.current.delete(id)
        }
      })

      markers.forEach((marker) => {
        const isSelected = marker.id === selectedId

        const icon = L.divIcon({
          html: `
            <div style="
              width: ${isSelected ? 44 : 36}px;
              height: ${isSelected ? 44 : 36}px;
              background: ${isSelected ? "linear-gradient(135deg, #4ade80, #16a34a)" : "linear-gradient(135deg, #22c55e, #15803d)"};
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid ${isSelected ? "#fff" : "rgba(255,255,255,0.7)"};
              box-shadow: 0 4px 20px rgba(34,197,94,0.5);
              transition: all 0.2s;
            ">
              <div style="
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                transform: rotate(45deg);
                font-size: ${isSelected ? "18px" : "14px"};
              ">🌳</div>
            </div>
          `,
          className: "",
          iconSize: [isSelected ? 44 : 36, isSelected ? 44 : 36],
          iconAnchor: [isSelected ? 22 : 18, isSelected ? 44 : 36],
        })

        if (markersRef.current.has(marker.id)) {
          const existing = markersRef.current.get(marker.id)!
          existing.setIcon(icon)
        } else {
          const leafletMarker = L.marker([marker.lat, marker.lng], { icon })
            .addTo(leafletMapRef.current!)
            .on("click", () => onSelectMarker(marker))

          markersRef.current.set(marker.id, leafletMarker)
        }
      })
    }

    updateMarkers()
  }, [markers, selectedId])

  const handleToggleAddMode = () => {
    setIsAddMode((prev) => !prev)
  }

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapRef}
        className="w-full h-full rounded-2xl overflow-hidden"
        style={{ cursor: isAddMode ? "crosshair" : "grab" }}
      />

      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={handleToggleAddMode}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 shadow-lg ${
            isAddMode
              ? "bg-green-500 text-white shadow-green-500/40"
              : "bg-[#0f1117]/90 text-[#f2f3f5] border border-white/10 hover:bg-white/10"
          }`}
        >
          <Icon name={isAddMode ? "MapPin" : "Plus"} size={16} />
          {isAddMode ? "Кликните на карту" : "Добавить дерево"}
        </button>
      </div>

      {isAddMode && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]">
          <div className="bg-[#0f1117]/95 border border-green-500/30 text-green-400 text-sm px-4 py-2 rounded-xl backdrop-blur-sm">
            Кликните на карту, чтобы поставить метку
          </div>
        </div>
      )}
    </div>
  )
}
