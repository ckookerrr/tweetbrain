import { NextRequest, NextResponse } from "next/server"
import {
  attachSessionCookie,
  clearPkceCookies,
  exchangeCode,
  fetchMe,
  getBaseUrl,
  getPkceCookies,
} from "@/lib/twitter-auth"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const err = url.searchParams.get("error")

  const base = getBaseUrl()
  const fail = (msg: string) => {
    const r = NextResponse.redirect(`${base}/?auth_error=${encodeURIComponent(msg)}`)
    clearPkceCookies(r)
    return r
  }

  if (err) return fail(err)
  if (!code || !state) return fail("missing_code")

  const { verifier, state: savedState } = await getPkceCookies()
  if (!verifier || !savedState || savedState !== state) return fail("state_mismatch")

  try {
    const tok = await exchangeCode(code, verifier)
    const me = await fetchMe(tok.access_token)
    const res = NextResponse.redirect(`${base}/`)
    attachSessionCookie(res, {
      access_token: tok.access_token,
      refresh_token: tok.refresh_token,
      twitter_id: me.id,
      username: me.username,
      expires_at: Date.now() + tok.expires_in * 1000,
    })
    clearPkceCookies(res)
    return res
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown"
    return fail(msg)
  }
}
