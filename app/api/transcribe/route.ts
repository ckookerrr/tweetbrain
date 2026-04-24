import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const apiKey = process.env.DEEPGRAM_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "DEEPGRAM_API_KEY not set" }, { status: 500 })
  }

  const audioBuffer = await req.arrayBuffer()
  const contentType = req.headers.get("content-type") || "audio/webm"

  const res = await fetch(
    "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&language=ru&detect_language=true",
    {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": contentType,
      },
      body: audioBuffer,
    }
  )

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: `Deepgram error: ${err.slice(0, 200)}` }, { status: 500 })
  }

  const data = await res.json()
  const transcript =
    data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? ""

  return NextResponse.json({ transcript })
}
