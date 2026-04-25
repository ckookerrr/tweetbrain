import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/twitter-auth"

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { text } = await req.json()
  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 })

  const res = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  })

  const data = await res.json()
  if (!res.ok) return NextResponse.json({ error: data }, { status: 500 })
  return NextResponse.json({ id: data.data?.id })
}
