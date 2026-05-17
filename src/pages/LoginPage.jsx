import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogoMark, Check } from '../components/landing/icons'
import ThemeToggle from '../components/shared/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import {
  DEMO_USERS,
  getDashboardPath,
  ROLE_LABELS,
  ROLES,
} from '../lib/auth'

const roleOptions = [
  {
    id: ROLES.employee,
    title: 'Employee',
    desc: 'Create goals, submit sheets, enter quarterly actuals',
    abbr: 'EM',
  },
  {
    id: ROLES.manager,
    title: 'Manager (L1)',
    desc: 'Approve team goals and run check-ins',
    abbr: 'M1',
  },
  {
    id: ROLES.admin,
    title: 'Admin / HR',
    desc: 'Cycles, reports, unlock goals, audit logs',
    abbr: 'HR',
  },
]

const highlights = [
  'Goal sheets with 100% weightage validation',
  'Manager approval & quarterly check-ins',
  'Audit-ready planned vs actual reporting',
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated, user } = useAuth()

  const [selectedRole, setSelectedRole] = useState(ROLES.employee)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDashboardPath(user.role), { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  if (isAuthenticated && user) {
    return (
      <div className="mesh-bg flex min-h-svh items-center justify-center text-ink-600">
        Redirecting…
      </div>
    )
  }

  const demoForRole = DEMO_USERS.find((u) => u.role === selectedRole)
  const employeeDemos = DEMO_USERS.filter((u) => u.role === ROLES.employee)

  function fillDemo() {
    if (!demoForRole) return
    setEmail(demoForRole.email)
    setPassword(demoForRole.password)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = login(email, password)
    setLoading(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    if (result.user.role !== selectedRole) {
      setError(
        `This account is a ${ROLE_LABELS[result.user.role]}. Select that role or use the matching demo account.`,
      )
      return
    }

    const path = getDashboardPath(result.user.role)
    navigate(path, { replace: true })
  }

  return (
    <div className="flex min-h-svh">
      {/* Left panel */}
      <div className="relative hidden w-[44%] overflow-hidden bg-ink-950 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700/40 via-ink-950 to-ink-950" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -right-10 bottom-32 h-64 w-64 rounded-full bg-teal-400/15 blur-3xl" />

        <div className="relative flex flex-col justify-between p-10 xl:p-14">
          <Link to="/" className="flex items-center gap-2.5 text-white">
            <LogoMark className="h-9 w-9" />
            <span className="text-xl font-semibold tracking-tight">
              Goal<span className="text-brand-400">Flow</span>
            </span>
          </Link>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-400">
              Goal Setting & Tracking
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-white xl:text-5xl">
              Sign in to align, track, and report
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-slate-400">
              One portal for goal creation, manager approval, quarterly
              check-ins, and HR-ready exports.
            </p>
            <ul className="mt-8 space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} GoalFlow · AtomQuest
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="mesh-bg flex flex-1 flex-col">
        <header className="flex items-center justify-between gap-2 px-4 py-4 sm:px-6 lg:hidden">
          <Link to="/" className="flex items-center gap-2 font-semibold text-ink-900 dark:text-slate-100">
            <LogoMark />
            <span>
              Goal<span className="text-brand-600">Flow</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/"
              className="text-sm font-medium text-ink-600 hover:text-brand-700 dark:text-slate-400"
            >
              ← Home
            </Link>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
          <div className="w-full max-w-md">
            <div className="mb-8 hidden lg:block">
              <div className="flex items-center justify-between gap-3">
                <Link
                  to="/"
                  className="text-sm font-medium text-ink-500 transition-colors hover:text-brand-700 dark:text-slate-400"
                >
                  ← Back to home
                </Link>
                <ThemeToggle />
              </div>
              <h2 className="mt-4 font-display text-3xl font-semibold text-ink-950">
                Welcome back
              </h2>
              <p className="mt-2 text-ink-600">
                Choose your role and sign in to continue.
              </p>
            </div>

            <div className="mb-6 lg:hidden">
              <h2 className="font-display text-2xl font-semibold text-ink-950">
                Sign in
              </h2>
              <p className="mt-1 text-sm text-ink-600">Select role and enter credentials</p>
            </div>

            {/* Role selector */}
            <fieldset className="mb-6">
              <legend className="sr-only">Sign in as</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {roleOptions.map((opt) => {
                  const active = selectedRole === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedRole(opt.id)
                        setError('')
                      }}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        active
                          ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/30'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-xs font-bold text-brand-800"
                        aria-hidden="true"
                      >
                        {opt.abbr}
                      </span>
                      <p className="mt-1 text-xs font-semibold text-ink-900 sm:text-sm">
                        {opt.title}
                      </p>
                    </button>
                  )
                })}
              </div>
              <p className="mt-2 text-xs text-ink-500">
                {roleOptions.find((r) => r.id === selectedRole)?.desc}
              </p>
            </fieldset>

            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/5"
            >
              {error && (
                <div
                  role="alert"
                  className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
                >
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-800">
                    Work email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-medium text-ink-800"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 pr-10 text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-ink-500 hover:text-ink-800"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition-all hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Signing in…' : `Sign in as ${ROLE_LABELS[selectedRole]}`}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-4 rounded-xl border border-dashed border-brand-300 bg-brand-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-800">
                Demo account
              </p>
              {selectedRole === ROLES.employee ? (
                <ul className="mt-2 space-y-2 text-xs text-ink-700">
                  {employeeDemos.map((u) => (
                    <li key={u.email}>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail(u.email)
                          setPassword(u.password)
                          setError('')
                        }}
                        className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-left hover:bg-brand-50"
                      >
                        <span className="font-mono font-semibold">{u.email}</span>
                        <span className="mt-0.5 block text-ink-500">
                          password: {u.password}
                          {u.demoNote ? ` · ${u.demoNote}` : ''}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                demoForRole && (
                  <p className="mt-2 font-mono text-xs text-ink-700">
                    {demoForRole.email} · password: {demoForRole.password}
                  </p>
                )
              )}
              <button
                type="button"
                onClick={fillDemo}
                className="mt-3 text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                Fill demo credentials →
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-ink-500">
              By signing in you agree to your organization&apos;s goal-cycle policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
