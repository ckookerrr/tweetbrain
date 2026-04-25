import { NextResponse } from "next/server"
import { getSession } from "@/lib/twitter-auth"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const [meRes, tweetsRes] = await Promise.all([
    fetch("https://api.twitter.com/2/users/me?user.fields=description,name", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    }),
    fetch(`https://api.twitter.com/2/users/${session.twitter_id}/tweets?max_results=100&tweet.fields=text&exclude=retweets,replies`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    }),
  ])

  const me = await meRes.json()
  const tweets = await tweetsRes.json()

  const bio = me.data?.description ?? ""
  const tweetTexts: string[] = (tweets.data ?? []).map((t: { text: string }) => t.text)

  return NextResponse.json({ bio, tweets: tweetTexts })
}
