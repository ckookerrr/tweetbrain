import { NextResponse } from "next/server"
import { getSession } from "@/lib/twitter-auth"

export async function GET() {
  const s = await getSession()
  if (!s) return NextResponse.json({ user: null })
  return NextResponse.json({ user: { id: s.twitter_id, username: s.username } })
}
