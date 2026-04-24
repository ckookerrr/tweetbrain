"use client"

import { useState, useRef } from "react"
import { Mic, Square, Loader2 } from "lucide-react"

interface VoiceRecorderProps {
  onTranscriptChange: (transcript: string) => void
  transcript: string
}

type State = "idle" | "recording" | "transcribing"

export default function VoiceRecorder({ onTranscriptChange, transcript }: VoiceRecorderProps) {
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

      // Pick best supported mime type
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg", "audio/mp4"]
        .find((t) => MediaRecorder.isTypeSupported(t)) ?? ""

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        clearInterval(timerRef.current!)
        setSeconds(0)
        await transcribeAudio(recorder.mimeType || mimeType || "audio/webm")
      }

      recorder.start(250) // collect chunks every 250ms
      mediaRecorderRef.current = recorder
      setState("recording")
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch (e) {
      setError("Microphone access denied. Please allow microphone and try again.")
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setState("transcribing")
  }

  const transcribeAudio = async (mimeType: string) => {
    const blob = new Blob(chunksRef.current, { type: mimeType })

    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": mimeType },
        body: blob,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const newText = data.transcript as string
      if (newText.trim()) {
        onTranscriptChange(transcript ? transcript + " " + newText : newText)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transcription failed")
    } finally {
      setState("idle")
    }
  }

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <button
          onClick={state === "recording" ? stopRecording : startRecording}
          disabled={state === "transcribing"}
          className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
            state === "recording"
              ? "bg-red-500 hover:bg-red-600 scale-110 shadow-red-500/40"
              : "bg-violet-600 hover:bg-violet-700 shadow-violet-500/30"
          }`}
        >
          {state === "recording" && (
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
          )}
          {state === "transcribing" ? (
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          ) : state === "recording" ? (
            <Square className="w-10 h-10 text-white" fill="white" />
          ) : (
            <Mic className="w-10 h-10 text-white" />
          )}
        </button>
      </div>

      <p className="text-center text-sm text-zinc-400">
        {state === "recording" && (
          <span className="text-red-400 font-mono">{formatTime(seconds)} · Tap to stop</span>
        )}
        {state === "transcribing" && (
          <span className="text-violet-400">Transcribing with Deepgram…</span>
        )}
        {state === "idle" && "Tap to record"}
      </p>

      {error && (
        <p className="text-sm text-red-400 text-center">{error}</p>
      )}

      <div className="space-y-1">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">
          Transcript {transcript && `· ${transcript.length} chars`}
        </label>
        <textarea
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          placeholder="Record your voice or type your ideas here…"
          className="w-full h-36 bg-zinc-800 text-white rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-zinc-500 text-sm"
        />
      </div>
    </div>
  )
}
