import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

export async function GET(req: NextRequest) {
  const session = await getServerSession()

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // Get user info + recent tweets for style analysis
  const [meRes, tweetsRes] = await Promise.all([
    fetch("https://api.twitter.com/2/users/me?user.fields=description,name", {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    }),
    fetch(`https://api.twitter.com/2/users/${session.twitterId}/tweets?max_results=100&tweet.fields=text&exclude=retweets,replies`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    }),
  ])

  const me = await meRes.json()
  const tweets = await tweetsRes.json()

  const bio = me.data?.description ?? ""
  const tweetTexts: string[] = (tweets.data ?? []).map((t: { text: string }) => t.text)

  return NextResponse.json({ bio, tweets: tweetTexts })
}
