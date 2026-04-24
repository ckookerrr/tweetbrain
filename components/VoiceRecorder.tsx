"use client"

import { useState, useRef } from "react"
import { Mic, Square, Loader2 } from "lucide-react"
import { useLang } from "@/lib/lang-context"

interface VoiceRecorderProps {
  onTranscriptChange: (transcript: string) => void
  transcript: string
}

type State = "idle" | "recording" | "transcribing"

export default function VoiceRecorder({ onTranscriptChange, transcript }: VoiceRecorderProps) {
  const { tr } = useLang()
  const [state, setState] = useState<State>("idle")
  const [error, setError] = useState("")
  const [seconds, setSeconds] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startRecording = async () => {
    setError("")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg", "audio/mp4"].find(t => MediaRecorder.isTypeSupported(t)) ?? ""
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        clearInterval(timerRef.current!)
        setSeconds(0)
        await transcribeAudio(recorder.mimeType || mimeType || "audio/webm")
      }
      recorder.start(250)
      mediaRecorderRef.current = recorder
      setState("recording")
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } catch {
      setError(tr.micDenied)
    }
  }

  const stopRecording = () => { mediaRecorderRef.current?.stop(); setState("transcribing") }

  const transcribeAudio = async (mimeType: string) => {
    const blob = new Blob(chunksRef.current, { type: mimeType })
    try {
      const res = await fetch("/api/transcribe", { method: "POST", headers: { "Content-Type": mimeType }, body: blob })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const newText = data.transcript as string
      if (newText.trim()) onTranscriptChange(transcript ? transcript + " " + newText : newText)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transcription failed")
    } finally {
      setState("idle")
    }
  }

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  return (
    <div className="space-y-4">
      {/* Record button */}
      <div className="flex items-center gap-4">
        <button
          onClick={state === "recording" ? stopRecording : startRecording}
          disabled={state === "transcribing"}
          className="relative w-14 h-14 rounded-full flex items-center justify-center transition-all"
          style={{
            background: state === "recording" ? "#f4212e" : "#1d9bf0",
            opacity: state === "transcribing" ? 0.5 : 1,
            boxShadow: state === "recording" ? "0 0 0 0 rgba(244,33,46,0.4)" : "none",
          }}
        >
          {state === "recording" && (
            <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(244,33,46,0.3)" }} />
          )}
          {state === "transcribing" ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : state === "recording" ? (
            <Square className="w-5 h-5 text-white" fill="white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>

        <div className="flex-1">
          {state === "recording" && (
            <div>
              <p className="text-sm font-mono font-bold" style={{ color: "#f4212e" }}>{formatTime(seconds)}</p>
              <p className="text-xs" style={{ color: "#71767b" }}>{tr.tapToStop}</p>
            </div>
          )}
          {state === "transcribing" && <p className="text-sm" style={{ color: "#1d9bf0" }}>{tr.transcribing}</p>}
          {state === "idle" && <p className="text-sm" style={{ color: "#71767b" }}>{tr.tapToRecord}</p>}
        </div>
      </div>

      {error && <p className="text-sm" style={{ color: "#f4212e" }}>{error}</p>}

      {/* Transcript */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#71767b" }}>
          {tr.transcriptLabel} {transcript && `· ${transcript.length}`}
        </p>
        <textarea
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          placeholder={tr.transcriptPlaceholder}
          rows={4}
          className="w-full rounded-2xl p-3 resize-none focus:outline-none text-sm border"
          style={{ background: "#000", color: "#e7e9ea", borderColor: "#2f3336", caretColor: "#1d9bf0" }}
          onFocus={(e) => (e.target.style.borderColor = "#1d9bf0")}
          onBlur={(e) => (e.target.style.borderColor = "#2f3336")}
        />
      </div>
    </div>
  )
}
