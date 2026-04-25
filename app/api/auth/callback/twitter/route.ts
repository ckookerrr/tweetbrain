import { NextRequest, NextResponse } from "next/server"
import { consumePkceCookie, exchangeCode, fetchMe, setSession } from "@/lib/twitter-auth"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const err = url.searchParams.get("error")

  const base = url.origin
  if (err) return NextResponse.redirect(`${base}/?auth_error=${encodeURIComponent(err)}`)
  if (!code || !state) return NextResponse.redirect(`${base}/?auth_error=missing_code`)

  const { verifier, state: savedState } = await consumePkceCookie()
  if (!verifier || !savedState || savedState !== state) {
    return NextResponse.redirect(`${base}/?auth_error=state_mismatch`)
  }

  try {
    const tok = await exchangeCode(code, verifier)
    const me = await fetchMe(tok.access_token)
    await setSession({
      access_token: tok.access_token,
      refresh_token: tok.refresh_token,
      twitter_id: me.id,
      username: me.username,
      expires_at: Date.now() + tok.expires_in * 1000,
    })
    return NextResponse.redirect(`${base}/`)
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown"
    return NextResponse.redirect(`${base}/?auth_error=${encodeURIComponent(msg)}`)
  }
}
