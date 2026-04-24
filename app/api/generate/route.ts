import { NextRequest, NextResponse } from "next/server"
import { generatePosts } from "@/lib/claude"

export async function POST(req: NextRequest) {
  try {
    const { transcript, images, userStyle } = await req.json()

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json({ error: "transcript is required" }, { status: 400 })
    }

    const posts = await generatePosts(
      transcript,
      Array.isArray(images) ? images : [],
      userStyle
    )

    return NextResponse.json(posts)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[generate]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
