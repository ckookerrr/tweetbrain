"use client"

import type { DraftEntry, GeneratedPosts, QueueEntry } from "./types"

const DRAFTS_KEY = "tweetbrain_drafts"
const QUEUE_KEY = "tweetbrain_queue"
const STYLE_KEY = "tweetbrain_style"

export function saveDraft(
  transcript: string,
  photoCount: number,
  posts: GeneratedPosts
): DraftEntry {
  const entry: DraftEntry = {
    id: `draft_${Date.now()}`,
    timestamp: Date.now(),
    transcript,
    photoCount,
    posts,
  }
  const existing = getDrafts()
  const updated = [entry, ...existing].slice(0, 50)
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(updated))
  return entry
}

export function getDrafts(): DraftEntry[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(DRAFTS_KEY) || "[]")
  } catch {
    return []
  }
}

export function deleteDraft(id: string) {
  const updated = getDrafts().filter((d) => d.id !== id)
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(updated))
}

export function getQueue(): QueueEntry[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]")
  } catch {
    return []
  }
}

export function saveToQueue(entry: QueueEntry) {
  const existing = getQueue()
  localStorage.setItem(QUEUE_KEY, JSON.stringify([...existing, entry]))
}

export function updateQueue(entries: QueueEntry[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(entries))
}

export function removeFromQueue(id: string) {
  const updated = getQueue().filter((e) => e.id !== id)
  localStorage.setItem(QUEUE_KEY, JSON.stringify(updated))
}

export function getUserStyle(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem(STYLE_KEY) || ""
}

export function saveUserStyle(style: string) {
  localStorage.setItem(STYLE_KEY, style)
}
