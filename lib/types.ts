export interface PostVariant {
  sizes: {
    s: string   // короткий ~100-150 символов
    m: string   // средний ~250-350 символов
    l: string   // длинный ~500-700 символов
  }
  hashtags: string[]
  best_time: string
  best_time_reason: string
  hook_alternatives: string[]
}

export interface ThreadVariant {
  tweets: string[]   // нумерация "1.", "2.", ...
  hashtags: string[]
  best_time: string
  best_time_reason: string
}

export interface GeneratedPosts {
  post: PostVariant
  thread: ThreadVariant
  dump: string   // чистые мысли без добавлений
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
  type: "post" | "thread" | "dump"
  content: string
  hashtags: string[]
  photoIndices: number[]
}
