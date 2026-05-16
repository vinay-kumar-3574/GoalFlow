import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  authenticate,
  clearSession,
  loadSession,
  saveSession,
} from '../lib/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadSession())

  const login = useCallback((email, password) => {
    const session = authenticate(email, password)
    if (!session) return { ok: false, error: 'Invalid email or password.' }
    saveSession(session)
    setUser(session)
    return { ok: true, user: session }
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
