import { useState, useRef } from "react"
import type { TreeMarker } from "./tree-map"
import Icon from "@/components/ui/icon"

interface TreeFormProps {
  initial?: Partial<TreeMarker>
  onSave: (data: Omit<TreeMarker, "id" | "lat" | "lng">) => void
  onCancel: () => void
  onDelete?: () => void
}

export function TreeForm({ initial, onSave, onCancel, onDelete }: TreeFormProps) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    species: initial?.species ?? "",
    diameter: initial?.diameter ?? 0,
    count: initial?.count ?? 1,
    height: initial?.height ?? 0,
    note: initial?.note ?? "",
    photo: initial?.photo ?? "",
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, photo: ev.target?.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[#f2f3f5] placeholder-[#a7abb3] focus:outline-none focus:border-green-500/60 focus:bg-white/8 transition-all"

  const labelClass = "block text-xs text-[#a7abb3] mb-1.5 font-medium"

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Наименование</label>
          <input
            className={inputClass}
            placeholder="Берёза, Дуб..."
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Порода</label>
          <input
            className={inputClass}
            placeholder="Betula pendula..."
            value={form.species}
            onChange={(e) => setForm((f) => ({ ...f, species: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Диаметр (см)</label>
          <input
            type="number"
            min={0}
            step={0.1}
            className={inputClass}
            placeholder="30"
            value={form.diameter || ""}
            onChange={(e) => setForm((f) => ({ ...f, diameter: parseFloat(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <label className={labelClass}>Количество</label>
          <input
            type="number"
            min={1}
            className={inputClass}
            placeholder="1"
            value={form.count}
            onChange={(e) => setForm((f) => ({ ...f, count: parseInt(e.target.value) || 1 }))}
          />
        </div>
        <div>
          <label className={labelClass}>Высота (м)</label>
          <input
            type="number"
            min={0}
            step={0.1}
            className={inputClass}
            placeholder="15"
            value={form.height || ""}
            onChange={(e) => setForm((f) => ({ ...f, height: parseFloat(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Примечание</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={2}
          placeholder="Состояние кроны, повреждения..."
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
        />
      </div>

      <div>
        <label className={labelClass}>Фотография</label>
        {form.photo ? (
          <div className="relative rounded-xl overflow-hidden border border-white/10">
            <img src={form.photo} alt="Дерево" className="w-full h-32 object-cover" />
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, photo: "" }))}
              className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center hover:bg-red-500/70 transition-colors"
            >
              <Icon name="X" size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-20 border-2 border-dashed border-white/15 rounded-xl flex flex-col items-center justify-center gap-1.5 text-[#a7abb3] hover:border-green-500/40 hover:text-green-400 transition-all"
          >
            <Icon name="Camera" size={20} />
            <span className="text-xs">Загрузить фото</span>
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 bg-green-600 hover:bg-green-500 text-white font-medium text-sm py-2.5 rounded-xl transition-colors"
        >
          Сохранить
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white/5 hover:bg-white/10 text-[#a7abb3] font-medium text-sm py-2.5 rounded-xl transition-colors border border-white/10"
        >
          Отмена
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="w-10 bg-red-500/10 hover:bg-red-500/25 text-red-400 rounded-xl transition-colors border border-red-500/20 flex items-center justify-center"
          >
            <Icon name="Trash2" size={16} />
          </button>
        )}
      </div>
    </form>
  )
}
