import { useState, useRef } from "react"
import { TreeMap, type TreeMarker } from "@/components/tree-map"
import { TreeForm } from "@/components/tree-form"
import Icon from "@/components/ui/icon"

type PanelMode = "list" | "add" | "edit" | "view"

function parseKML(text: string): Partial<TreeMarker>[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, "application/xml")
  const placemarks = doc.querySelectorAll("Placemark")
  const results: Partial<TreeMarker>[] = []

  placemarks.forEach((pm) => {
    const coordEl = pm.querySelector("coordinates")
    if (!coordEl) return
    const [lng, lat] = coordEl.textContent?.trim().split(",").map(Number) ?? []
    if (isNaN(lat) || isNaN(lng)) return

    const name = pm.querySelector("name")?.textContent ?? "Дерево"
    results.push({ lat, lng, name })
  })

  return results
}

function exportKML(markers: TreeMarker[]): string {
  const placemarks = markers
    .map(
      (m) => `
  <Placemark>
    <name>${m.name}</name>
    <description>
      Порода: ${m.species}
      Диаметр: ${m.diameter} см
      Высота: ${m.height} м
      Количество: ${m.count}
      Примечание: ${m.note ?? ""}
    </description>
    <Point><coordinates>${m.lng},${m.lat},0</coordinates></Point>
  </Placemark>`
    )
    .join("")

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Ведомость деревьев</name>${placemarks}
  </Document>
</kml>`
}

export default function TreeRegisterPage() {
  const [markers, setMarkers] = useState<TreeMarker[]>([])
  const [panelMode, setPanelMode] = useState<PanelMode>("list")
  const [selectedMarker, setSelectedMarker] = useState<TreeMarker | null>(null)
  const [pendingCoords, setPendingCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [search, setSearch] = useState("")
  const [isLoaded, setIsLoaded] = useState(true)
  const kmlInputRef = useRef<HTMLInputElement>(null)

  const filteredMarkers = markers.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.species.toLowerCase().includes(search.toLowerCase())
  )

  const totalTrees = markers.reduce((sum, m) => sum + m.count, 0)

  const handleAddMarker = (lat: number, lng: number) => {
    setPendingCoords({ lat, lng })
    setPanelMode("add")
  }

  const handleSaveNew = (data: Omit<TreeMarker, "id" | "lat" | "lng">) => {
    if (!pendingCoords) return
    const newMarker: TreeMarker = {
      id: crypto.randomUUID(),
      ...pendingCoords,
      ...data,
    }
    setMarkers((prev) => [...prev, newMarker])
    setPendingCoords(null)
    setPanelMode("list")
  }

  const handleSaveEdit = (data: Omit<TreeMarker, "id" | "lat" | "lng">) => {
    if (!selectedMarker) return
    setMarkers((prev) =>
      prev.map((m) => (m.id === selectedMarker.id ? { ...m, ...data } : m))
    )
    setSelectedMarker(null)
    setPanelMode("list")
  }

  const handleDelete = () => {
    if (!selectedMarker) return
    setMarkers((prev) => prev.filter((m) => m.id !== selectedMarker.id))
    setSelectedMarker(null)
    setPanelMode("list")
  }

  const handleSelectMarker = (marker: TreeMarker) => {
    setSelectedMarker(marker)
    setPanelMode("view")
  }

  const handleKMLImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const parsed = parseKML(text)
      const newMarkers: TreeMarker[] = parsed.map((p) => ({
        id: crypto.randomUUID(),
        lat: p.lat!,
        lng: p.lng!,
        name: p.name ?? "Дерево",
        species: "",
        diameter: 0,
        count: 1,
        height: 0,
      }))
      setMarkers((prev) => [...prev, ...newMarkers])
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const handleKMLExport = () => {
    const kml = exportKML(markers)
    const blob = new Blob([kml], { type: "application/vnd.google-earth.kml+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "деревья.kml"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0B0C0F] text-[#F2F3F5] overflow-hidden">
      {/* Header */}
      <header className="flex-none flex items-center justify-between px-5 py-3 border-b border-white/8 bg-[#0f1117]/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-base">
            🌳
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide">Ведомость деревьев</div>
            <div className="text-xs text-[#a7abb3]">Учёт и картирование</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-4 mr-3">
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{markers.length}</div>
              <div className="text-xs text-[#a7abb3]">меток</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-400">{totalTrees}</div>
              <div className="text-xs text-[#a7abb3]">деревьев</div>
            </div>
          </div>

          <button
            onClick={() => kmlInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <Icon name="Upload" size={14} />
            <span className="hidden sm:inline">Импорт KML</span>
          </button>

          <button
            onClick={handleKMLExport}
            disabled={markers.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-green-600/20 hover:bg-green-600/35 border border-green-600/30 text-green-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="Download" size={14} />
            <span className="hidden sm:inline">Экспорт KML</span>
          </button>

          <input ref={kmlInputRef} type="file" accept=".kml" className="hidden" onChange={handleKMLImport} />
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="flex-none w-80 flex flex-col border-r border-white/8 bg-[#0d0e12] overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-white/8">
            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a7abb3]" />
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-[#f2f3f5] placeholder-[#a7abb3] focus:outline-none focus:border-green-500/50 transition-all"
                placeholder="Поиск по названию..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-3">
            {panelMode === "add" && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-200">
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => { setPanelMode("list"); setPendingCoords(null) }}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <Icon name="ArrowLeft" size={14} />
                  </button>
                  <h3 className="text-sm font-semibold">Новое дерево</h3>
                </div>
                {pendingCoords && (
                  <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
                    <Icon name="MapPin" size={13} className="text-green-400" />
                    <span className="text-xs text-green-400">
                      {pendingCoords.lat.toFixed(5)}, {pendingCoords.lng.toFixed(5)}
                    </span>
                  </div>
                )}
                <TreeForm onSave={handleSaveNew} onCancel={() => { setPanelMode("list"); setPendingCoords(null) }} />
              </div>
            )}

            {panelMode === "edit" && selectedMarker && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-200">
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => { setPanelMode("view") }}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <Icon name="ArrowLeft" size={14} />
                  </button>
                  <h3 className="text-sm font-semibold">Редактировать</h3>
                </div>
                <TreeForm
                  initial={selectedMarker}
                  onSave={handleSaveEdit}
                  onCancel={() => setPanelMode("view")}
                  onDelete={handleDelete}
                />
              </div>
            )}

            {panelMode === "view" && selectedMarker && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-200">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => { setPanelMode("list"); setSelectedMarker(null) }}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <Icon name="ArrowLeft" size={14} />
                  </button>
                  <button
                    onClick={() => setPanelMode("edit")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium transition-colors border border-white/10"
                  >
                    <Icon name="Pencil" size={12} />
                    Изменить
                  </button>
                </div>

                {selectedMarker.photo && (
                  <div className="rounded-xl overflow-hidden mb-3 border border-white/10">
                    <img src={selectedMarker.photo} alt={selectedMarker.name} className="w-full h-40 object-cover" />
                  </div>
                )}

                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🌳</span>
                    <h2 className="text-base font-semibold">{selectedMarker.name}</h2>
                  </div>
                  {selectedMarker.species && (
                    <p className="text-xs text-[#a7abb3] italic pl-8">{selectedMarker.species}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: "Диаметр", value: `${selectedMarker.diameter} см`, icon: "Circle" },
                    { label: "Высота", value: `${selectedMarker.height} м`, icon: "ArrowUp" },
                    { label: "Кол-во", value: String(selectedMarker.count), icon: "Trees" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/5 rounded-xl p-2.5 text-center border border-white/8">
                      <div className="text-base font-bold text-green-400">{stat.value}</div>
                      <div className="text-xs text-[#a7abb3] mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/8 mb-3">
                  <Icon name="MapPin" size={12} className="text-[#a7abb3] flex-none" />
                  <span className="text-xs text-[#a7abb3]">
                    {selectedMarker.lat.toFixed(5)}, {selectedMarker.lng.toFixed(5)}
                  </span>
                </div>

                {selectedMarker.note && (
                  <div className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/8">
                    <div className="text-xs text-[#a7abb3] mb-1">Примечание</div>
                    <div className="text-sm">{selectedMarker.note}</div>
                  </div>
                )}
              </div>
            )}

            {panelMode === "list" && (
              <>
                {filteredMarkers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
                    <div className="text-4xl opacity-30">🌳</div>
                    <div className="text-sm text-[#a7abb3]">
                      {markers.length === 0
                        ? "Нажмите «Добавить дерево» на карте"
                        : "Ничего не найдено"}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {filteredMarkers.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleSelectMarker(m)}
                        className={`w-full text-left p-3 rounded-xl border transition-all duration-150 group ${
                          selectedMarker?.id === m.id
                            ? "bg-green-500/10 border-green-500/30"
                            : "bg-white/3 border-white/8 hover:bg-white/6 hover:border-white/15"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base flex-none">🌳</span>
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">{m.name}</div>
                              {m.species && (
                                <div className="text-xs text-[#a7abb3] italic truncate">{m.species}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex-none text-right">
                            <div className="text-xs text-green-400 font-medium">{m.count} шт.</div>
                            <div className="text-xs text-[#a7abb3]">⌀{m.diameter}см</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Stats footer */}
          <div className="flex-none p-3 border-t border-white/8 md:hidden">
            <div className="flex justify-around">
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{markers.length}</div>
                <div className="text-xs text-[#a7abb3]">меток</div>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <div className="text-lg font-bold text-emerald-400">{totalTrees}</div>
                <div className="text-xs text-[#a7abb3]">деревьев</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Map */}
        <main className="flex-1 relative">
          <TreeMap
            markers={markers}
            onAddMarker={handleAddMarker}
            onSelectMarker={handleSelectMarker}
            selectedId={selectedMarker?.id}
          />
        </main>
      </div>
    </div>
  )
}
