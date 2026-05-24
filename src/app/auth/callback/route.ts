import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    // Even if there's an error exchanging code, check if user is already logged in
    // (Supabase may have already exchanged the code via PKCE)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    // Code exchange failed, but user may already have a session — check
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // No code and no session — go to login
  return NextResponse.redirect(`${origin}/login`)
}
