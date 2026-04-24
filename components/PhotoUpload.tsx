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

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const remaining = 20 - photos.length
      const toProcess = Array.from(files).slice(0, remaining)
      const base64s = await Promise.all(toProcess.map(readFile))
      onPhotosChange([...photos, ...base64s])
    },
    [photos, onPhotosChange]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      addFiles(e.dataTransfer.files)
    },
    [addFiles]
  )

  const removePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-zinc-700 hover:border-violet-500 rounded-xl p-6 text-center cursor-pointer transition-colors group"
      >
        <ImagePlus className="w-8 h-8 mx-auto mb-2 text-zinc-500 group-hover:text-violet-400 transition-colors" />
        <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
          {tr.photoDropHint}
        </p>
        <p className="text-xs text-zinc-600 mt-1">{photos.length}/20</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {photos.map((b64, i) => (
            <div key={i} className="relative group aspect-square">
              <img
                src={`data:image/jpeg;base64,${b64}`}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
              <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 rounded">
                {i}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
