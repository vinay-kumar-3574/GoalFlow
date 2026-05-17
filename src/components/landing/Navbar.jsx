import { Link } from 'react-router-dom'
import { LogoMark } from './icons'
import ThemeToggle from '../shared/ThemeToggle'

const links = [
  { href: '#features', label: 'Features' },
  { href: '#lifecycle', label: 'Lifecycle' },
  { href: '#roles', label: 'Roles' },
  { href: '#schedule', label: 'Schedule' },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
        aria-label="Main"
      >
        <Link
          to="/"
          className="flex items-center gap-2.5 font-semibold text-ink-900 transition-opacity hover:opacity-80 dark:text-slate-100"
        >
          <LogoMark />
          <span className="text-lg tracking-tight">
            Goal<span className="text-brand-600">Flow</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                className="text-sm font-medium text-ink-600 transition-colors hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-400"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/25 transition-all hover:bg-brand-700 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Sign in
          </Link>
        </div>
      </nav>
    </header>
  )
}
