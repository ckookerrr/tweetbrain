"use client"

import { useCallback, useRef } from "react"
import { ImagePlus, X } from "lucide-react"
import { useLang } from "@/lib/lang-context"

interface PhotoUploadProps {
  photos: string[]
  onPhotosChange: (photos: string[]) => void
}

export default function PhotoUpload({ photos, onPhotosChange }: PhotoUploadProps) {
  const { tr } = useLang()
  const inputRef = useRef<HTMLInputElement>(null)

  const readFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve((e.target?.result as string).split(",")[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const remaining = 20 - photos.length
    const base64s = await Promise.all(Array.from(files).slice(0, remaining).map(readFile))
    onPhotosChange([...photos, ...base64s])
  }, [photos, onPhotosChange])

  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); addFiles(e.dataTransfer.files) }, [addFiles])

  return (
    <div className="space-y-3">
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-3 rounded-2xl p-3 cursor-pointer border transition-all"
        style={{ borderColor: "#2f3336", background: "#16181c" }}
      >
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(29,155,240,0.1)" }}>
          <ImagePlus className="w-4 h-4" style={{ color: "#1d9bf0" }} />
        </div>
        <p className="text-sm" style={{ color: "#71767b" }}>{tr.photoDropHint}</p>
        <span className="ml-auto text-xs font-semibold" style={{ color: "#1d9bf0" }}>{photos.length}/20</span>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} />
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {photos.map((b64, i) => (
            <div key={i} className="relative group aspect-square">
              <img src={`data:image/jpeg;base64,${b64}`} alt="" className="w-full h-full object-cover rounded-xl" />
              <button
                onClick={() => onPhotosChange(photos.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.7)" }}
              >
                <X className="w-3 h-3 text-white" />
              </button>
              <span className="absolute bottom-1 left-1 text-xs px-1 rounded" style={{ background: "rgba(0,0,0,0.7)", color: "#fff" }}>{i}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
