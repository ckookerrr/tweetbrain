import { NextResponse } from "next/server"
import { generatePkce, generateState, getAuthorizeUrl, setPkceCookie } from "@/lib/twitter-auth"

export async function GET() {
  const { verifier, challenge } = generatePkce()
  const state = generateState()
  await setPkceCookie(verifier, state)
  return NextResponse.redirect(getAuthorizeUrl(state, challenge))
}
