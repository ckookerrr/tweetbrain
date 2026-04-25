import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

export async function POST(req: NextRequest) {
  const session = await getServerSession()

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { text } = await req.json()
  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 })

  const res = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  })

  const data = await res.json()
  if (!res.ok) return NextResponse.json({ error: data }, { status: 500 })
  return NextResponse.json({ id: data.data?.id })
}
