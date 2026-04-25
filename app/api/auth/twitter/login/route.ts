import { NextResponse } from "next/server"
import { generatePkce, generateState, getAuthorizeUrl, attachPkceCookies } from "@/lib/twitter-auth"

export async function GET() {
  const { verifier, challenge } = generatePkce()
  const state = generateState()
  const res = NextResponse.redirect(getAuthorizeUrl(state, challenge))
  attachPkceCookies(res, verifier, state)
  return res
}
