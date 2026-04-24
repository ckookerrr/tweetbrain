import type { GeneratedPosts } from "./types"

const OPENROUTER_BASE = "https://openrouter.ai/api/v1"
const MODEL = "google/gemini-2.5-flash"

const SYSTEM_PROMPT = `You are a Twitter ghostwriter. You receive a raw voice transcript (with filler words, repetitions, incomplete thoughts) and a set of photos from a blogger's day.

Your job:
1. Extract the core ideas and insights from the transcript
2. Analyze each photo
3. Match the most relevant 1-2 photos to the content
4. Generate 3 post variants:
   - SHORT: single punchy post, hook-first, no character limit
   - THREAD: 4-6 tweet thread (1/n format), structured argument
   - PROVOCATIVE: contrarian or bold take on the same idea, no character limit

For each variant also return:
- selected_photo_indices: array of photo indices that best match (0-based)
- hashtags: 3-5 relevant hashtags
- best_time: "morning", "lunch", or "evening"
- best_time_reason: one sentence reason
- hook_alternatives: 2 alternative opening lines for A/B testing

Return ONLY valid JSON matching this exact schema, no markdown, no explanation:
{
  "short": {
    "content": "...",
    "selected_photo_indices": [],
    "hashtags": [],
    "best_time": "morning|lunch|evening",
    "best_time_reason": "...",
    "hook_alternatives": ["...", "..."]
  },
  "thread": {
    "tweets": ["1/n ...", "2/n ...", "..."],
    "selected_photo_indices": [],
    "hashtags": [],
    "best_time": "morning|lunch|evening",
    "best_time_reason": "...",
    "hook_alternatives": ["...", "..."]
  },
  "provocative": {
    "content": "...",
    "selected_photo_indices": [],
    "hashtags": [],
    "best_time": "morning|lunch|evening",
    "best_time_reason": "...",
    "hook_alternatives": ["...", "..."]
  }
}`

type OAIContent =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }

export async function generatePosts(
  transcript: string,
  images: string[],
  userStyle?: string,
  lang: "ru" | "en" = "ru"
): Promise<GeneratedPosts> {
  const langInstruction = lang === "ru"
    ? "\n\nIMPORTANT: Write ALL post content, hashtags, hook_alternatives, and best_time_reason in RUSSIAN language."
    : "\n\nWrite all content in English."

  const systemPrompt = (userStyle
    ? `${SYSTEM_PROMPT}\n\nUser's writing style (match this tone):\n${userStyle}`
    : SYSTEM_PROMPT) + langInstruction

  const userContent: OAIContent[] = []

  images.forEach((base64, i) => {
    const mimeType = base64.startsWith("/9j/") ? "image/jpeg" : "image/png"
    userContent.push({
      type: "image_url",
      image_url: { url: `data:${mimeType};base64,${base64}` },
    })
    userContent.push({ type: "text", text: `[Photo ${i}]` })
  })

  userContent.push({ type: "text", text: `Voice transcript:\n${transcript}` })

  const call = async () => {
    const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://tweetbrain.local",
        "X-Title": "TweetBrain",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4096,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`OpenRouter error ${res.status}: ${err.slice(0, 200)}`)
    }

    const data = await res.json()
    const text: string = data.choices?.[0]?.message?.content ?? ""
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim()

    try {
      return JSON.parse(cleaned) as GeneratedPosts
    } catch {
      throw new Error(`Failed to parse model response: ${text.slice(0, 300)}`)
    }
  }

  // Retry once on failure
  try {
    return await call()
  } catch (e) {
    const msg = e instanceof Error ? e.message : ""
    if (msg.includes("504") || msg.includes("aborted") || msg.includes("parse")) {
      return await call()
    }
    throw e
  }
}
