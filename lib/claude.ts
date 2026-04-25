import type { GeneratedPosts } from "./types"

const OPENROUTER_BASE = "https://openrouter.ai/api/v1"
const MODEL = "google/gemini-2.5-flash"

const SYSTEM_PROMPT = `You are a Twitter ghostwriter. You receive a raw voice transcript and optional photos.

Your job: generate 3 outputs.

1. POST — one polished Twitter post in 3 length variants from the same idea:
   - s (short): punchy hook, ~100-150 chars, one strong sentence
   - m (medium): developed thought, ~250-350 chars, 2-3 sentences
   - l (long): full argument, ~500-700 chars, no limit on sentences
   All 3 variants must express the SAME core idea, just at different depths.
   Also provide: hashtags (3-5), best_time, best_time_reason, hook_alternatives (2 lines).

2. THREAD — structured argument split into 4-6 numbered tweets.
   Number them "1.", "2.", "3." etc — no "1/5" format, just plain numbers.
   Also provide: hashtags (3-5), best_time, best_time_reason.

3. DUMP — clean up the transcript ONLY. Remove filler words ("эм", "ну", "короче", "типа", "вот", "ну вот", "так сказать", "как бы"), fix obvious stutters, fix punctuation.
   DO NOT add any new ideas, sentences, conclusions or insights that weren't in the original.
   DO NOT rephrase or improve style. Keep every original thought exactly as said.
   If the person said 2 sentences — output 2 sentences. Keep it raw and authentic.

Return ONLY valid JSON, no markdown:
{
  "post": {
    "sizes": { "s": "...", "m": "...", "l": "..." },
    "hashtags": [],
    "best_time": "morning|lunch|evening",
    "best_time_reason": "...",
    "hook_alternatives": ["...", "..."]
  },
  "thread": {
    "tweets": ["1. ...", "2. ...", "3. ..."],
    "hashtags": [],
    "best_time": "morning|lunch|evening",
    "best_time_reason": "..."
  },
  "dump": "..."
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
    ? "\n\nIMPORTANT: Write ALL content (post, thread, dump, hashtags, hook_alternatives, best_time_reason) in RUSSIAN."
    : "\n\nWrite all content in English."

  const systemPrompt = (userStyle
    ? `${SYSTEM_PROMPT}\n\nUser's writing style (match this tone):\n${userStyle}`
    : SYSTEM_PROMPT) + langInstruction

  const userContent: OAIContent[] = []
  images.forEach((base64, i) => {
    const mimeType = base64.startsWith("/9j/") ? "image/jpeg" : "image/png"
    userContent.push({ type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } })
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
      const parsed = JSON.parse(cleaned) as GeneratedPosts
      // Strip leading # from hashtags so UI can add it consistently
      const stripHash = (h: string) => h.replace(/^#+/, "").trim()
      if (parsed.post?.hashtags) parsed.post.hashtags = parsed.post.hashtags.map(stripHash).filter(Boolean)
      if (parsed.thread?.hashtags) parsed.thread.hashtags = parsed.thread.hashtags.map(stripHash).filter(Boolean)
      return parsed
    } catch {
      throw new Error(`Failed to parse model response: ${text.slice(0, 300)}`)
    }
  }

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
