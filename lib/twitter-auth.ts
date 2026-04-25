import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import crypto from "crypto"

const COOKIE_NAME = "tb_twitter"
const PKCE_COOKIE = "tb_pkce"
const STATE_COOKIE = "tb_state"

export interface TwitterSession {
  access_token: string
  refresh_token?: string
  twitter_id: string
  username?: string
  expires_at: number
}

function base64url(buf: Buffer) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

export function generatePkce() {
  const verifier = base64url(crypto.randomBytes(32))
  const challenge = base64url(crypto.createHash("sha256").update(verifier).digest())
  return { verifier, challenge }
}

export function generateState() {
  return base64url(crypto.randomBytes(16))
}

export function getBaseUrl() {
  const base = process.env.NEXTAUTH_URL || "https://tweetbrain-production.up.railway.app"
  return base.replace(/\/$/, "")
}

export function getRedirectUri() {
  return `${getBaseUrl()}/api/auth/callback/twitter`
}

export function getAuthorizeUrl(state: string, challenge: string) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.TWITTER_CLIENT_ID!,
    redirect_uri: getRedirectUri(),
    scope: "tweet.read tweet.write users.read offline.access",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  })
  return `https://twitter.com/i/oauth2/authorize?${params.toString()}`
}

export async function exchangeCode(code: string, verifier: string) {
  const basic = Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64")
  const body = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    redirect_uri: getRedirectUri(),
    code_verifier: verifier,
    client_id: process.env.TWITTER_CLIENT_ID!,
  })
  const res = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Token exchange failed: ${res.status} ${errText}`)
  }
  return res.json() as Promise<{
    access_token: string
    refresh_token?: string
    expires_in: number
    scope: string
    token_type: string
  }>
}

export async function fetchMe(accessToken: string) {
  const res = await fetch("https://api.twitter.com/2/users/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`fetchMe failed ${res.status}`)
  const data = await res.json()
  return { id: data.data.id as string, username: data.data.username as string }
}

const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
}

export function attachSessionCookie(res: NextResponse, s: TwitterSession) {
  res.cookies.set(COOKIE_NAME, JSON.stringify(s), { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 30 })
}

export function attachPkceCookies(res: NextResponse, verifier: string, state: string) {
  res.cookies.set(PKCE_COOKIE, verifier, { ...COOKIE_OPTS, maxAge: 600 })
  res.cookies.set(STATE_COOKIE, state, { ...COOKIE_OPTS, maxAge: 600 })
}

export function clearPkceCookies(res: NextResponse) {
  res.cookies.set(PKCE_COOKIE, "", { ...COOKIE_OPTS, maxAge: 0 })
  res.cookies.set(STATE_COOKIE, "", { ...COOKIE_OPTS, maxAge: 0 })
}

export async function getSession(): Promise<TwitterSession | null> {
  const c = await cookies()
  const raw = c.get(COOKIE_NAME)?.value
  if (!raw) return null
  try {
    const s = JSON.parse(raw) as TwitterSession
    if (s.expires_at && s.expires_at < Date.now()) return null
    return s
  } catch {
    return null
  }
}

export async function getPkceCookies() {
  const c = await cookies()
  return {
    verifier: c.get(PKCE_COOKIE)?.value,
    state: c.get(STATE_COOKIE)?.value,
  }
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, "", { ...COOKIE_OPTS, maxAge: 0 })
}
