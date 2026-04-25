import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getBaseUrl, getRedirectUri } from "@/lib/twitter-auth"

export async function GET() {
  const c = await cookies()
  const all = c.getAll().map(k => ({ name: k.name, len: k.value?.length ?? 0 }))
  return NextResponse.json({
    base: getBaseUrl(),
    redirect_uri: getRedirectUri(),
    has_client_id: !!process.env.TWITTER_CLIENT_ID,
    has_client_secret: !!process.env.TWITTER_CLIENT_SECRET,
    has_nextauth_url: !!process.env.NEXTAUTH_URL,
    cookies: all,
  })
}
