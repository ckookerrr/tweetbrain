export interface PostVariant {
  content: string
  selected_photo_indices: number[]
  hashtags: string[]
  best_time: string
  best_time_reason: string
  hook_alternatives: string[]
}

export interface GeneratedPosts {
  short: PostVariant
  thread: ThreadVariant
  provocative: PostVariant
}

export interface ThreadVariant {
  tweets: string[]
  selected_photo_indices: number[]
  hashtags: string[]
  best_time: string
  best_time_reason: string
  hook_alternatives: string[]
}

export interface DraftEntry {
  id: string
  timestamp: number
  transcript: string
  photoCount: number
  posts: GeneratedPosts
}

export interface QueueEntry {
  id: string
  savedAt: number
  type: "short" | "thread" | "provocative"
  content: string
  hashtags: string[]
  photoIndices: number[]
}
