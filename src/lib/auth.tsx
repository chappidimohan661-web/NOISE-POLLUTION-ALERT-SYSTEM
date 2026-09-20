import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, type Profile } from './supabase'

interface AuthContextValue {
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string, role: Profile['role'], department: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      if (!data.session) setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      ;(async () => {
        if (!mounted) return
        setSession(sess)
        if (!sess) {
          setProfile(null)
          setLoading(false)
        } else {
          const { data } = await supabase.from('profiles').select('*').eq('id', sess.user.id).maybeSingle()
          if (mounted) {
            setProfile(data as Profile | null)
            setLoading(false)
          }
        }
      })()
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? error.message : null }
  }

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: Profile['role'],
    department: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role, department } },
    })
    if (error) return { error: error.message }
    if (data.user) {
      // Profile is created by trigger; fetch it
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle()
      if (prof) setProfile(prof as Profile)
    }
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
