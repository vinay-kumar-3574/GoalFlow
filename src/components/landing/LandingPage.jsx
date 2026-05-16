import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import { ArrowRight, Check, LogoMark } from './icons'

const painPoints = [
  {
    title: 'Misalignment',
    desc: 'Employees lose sight of how daily work connects to company priorities.',
  },
  {
    title: 'Blind spots',
    desc: 'Managers rely on spreadsheets and email — no live view of team progress.',
  },
  {
    title: 'Appraisal scramble',
    desc: 'HR reconstructs achievement data at year-end instead of trusting the system.',
  },
]

const features = [
  {
    phase: 'Phase 1',
    title: 'Goal creation & approval',
    items: [
      'Thrust areas, titles, UoM & targets',
      'Weightage validated to 100%',
      'Manager approve, edit, or return',
      'Locked goals after approval',
    ],
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    phase: 'Phase 2',
    title: 'Quarterly check-ins',
    items: [
      'Planned vs actual achievement',
      'Status: Not started · On track · Done',
      'Manager structured feedback',
      'Auto progress scores by UoM',
    ],
    accent: 'from-teal-500 to-cyan-600',
  },
  {
    phase: 'Shared',
    title: 'Departmental KPIs',
    items: [
      'Push KPIs to many employees',
      'Recipients adjust weightage only',
      'Primary owner syncs actuals',
      'One truth, aligned sheets',
    ],
    accent: 'from-cyan-500 to-sky-600',
  },
  {
    phase: 'Governance',
    title: 'Reporting & audit',
    items: [
      'CSV / Excel achievement exports',
      'Completion dashboard',
      'Audit trail after lock date',
      'Admin unlock exceptions',
    ],
    accent: 'from-sky-500 to-blue-600',
  },
]

const lifecycle = [
  { step: '01', label: 'Create', desc: 'Draft goal sheet with thrust areas & targets' },
  { step: '02', label: 'Align', desc: 'Manager reviews, edits inline, approves' },
  { step: '03', label: 'Track', desc: 'Quarterly actuals & progress status' },
  { step: '04', label: 'Report', desc: 'Exportable planned vs actual for HR' },
]

const roles = [
  {
    role: 'Employee',
    color: 'border-emerald-200 bg-emerald-50/80',
    badge: 'bg-emerald-100 text-emerald-800',
    duties: ['Draft & submit goals', 'Enter quarterly actuals', 'Update progress status'],
  },
  {
    role: 'Manager (L1)',
    color: 'border-teal-200 bg-teal-50/80',
    badge: 'bg-teal-100 text-teal-800',
    duties: ['Approve or return sheets', 'Team planned vs actual view', 'Structured check-in comments'],
  },
  {
    role: 'Admin / HR',
    color: 'border-slate-200 bg-slate-50/80',
    badge: 'bg-slate-200 text-slate-800',
    duties: ['Configure cycles & org', 'Unlock locked goals', 'Audit logs & completion rates'],
  },
]

const schedule = [
  { period: 'Phase 1 — Goal Setting', window: '1 May', action: 'Create, submit & approve goals' },
  { period: 'Q1 Check-in', window: 'July', action: 'Planned vs actual update' },
  { period: 'Q2 Check-in', window: 'October', action: 'Planned vs actual update' },
  { period: 'Q3 Check-in', window: 'January', action: 'Planned vs actual update' },
  { period: 'Q4 / Annual', window: 'Mar – Apr', action: 'Final achievement capture' },
]

const validations = [
  { value: '100%', label: 'Total weightage across goals' },
  { value: '10%', label: 'Minimum per goal' },
  { value: '8', label: 'Maximum goals per employee' },
]

function HeroMockup() {
  const goals = [
    { title: 'Revenue growth', weight: '30%', status: 'On track', pct: 78 },
    { title: 'Customer NPS', weight: '25%', status: 'On track', pct: 92 },
    { title: 'Process TAT', weight: '20%', status: 'Completed', pct: 100 },
  ]

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-brand-400/20 to-teal-400/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 text-xs font-medium text-slate-500">Goal Sheet — FY26</span>
        </div>
        <div className="space-y-3 p-4">
          {goals.map((g) => (
            <div
              key={g.title}
              className="rounded-xl border border-slate-100 bg-slate-50/50 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{g.title}</p>
                  <p className="text-xs text-slate-500">Weight {g.weight}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  {g.status}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
                  style={{ width: `${g.pct}%` }}
                />
              </div>
              <p className="mt-1 text-right text-xs font-medium text-brand-600">{g.pct}%</p>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2">
            <span className="text-xs font-medium text-brand-800">Total weightage</span>
            <span className="text-sm font-bold text-brand-700">100%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="mesh-bg min-h-svh">
      <Navbar />

      <main>
        <section className="relative overflow-hidden px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pb-28">
          <div className="pointer-events-none absolute inset-0 grid-pattern opacity-60" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
                Goal Setting & Tracking Portal
              </p>
              <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink-950 sm:text-5xl lg:text-[3.25rem]">
                Turn goals from{' '}
                <span className="text-gradient">spreadsheets</span> into shared
                momentum
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-600 lg:mx-0">
                GoalFlow gives your organization one structured portal for goal
                creation, manager approval, quarterly check-ins, and audit-ready
                reporting — so alignment, visibility, and accountability stay
                continuous, not year-end.
              </p>
              <div
                id="get-started"
                className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
              >
                <Link
                  to="/login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition-all hover:bg-brand-700 hover:shadow-xl sm:w-auto"
                >
                  Sign in to portal
                  <ArrowRight />
                </Link>
                <a
                  href="#schedule"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-ink-800 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
                >
                  View check-in calendar
                </a>
              </div>
              <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-500 lg:justify-start">
                {['End-to-end lifecycle', 'Role-based access', 'Audit-ready'].map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-brand-600" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <HeroMockup />
          </div>
        </section>

        <section className="border-y border-slate-200/80 bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-semibold text-ink-950 sm:text-4xl">
                Why teams switch to GoalFlow
              </h2>
              <p className="mt-3 text-ink-600">
                Replace fragmented tools with one digital system built for the full
                goal lifecycle.
              </p>
            </div>
            <ul className="mt-12 grid gap-6 sm:grid-cols-3">
              {painPoints.map((p) => (
                <li
                  key={p.title}
                  className="group rounded-2xl border border-slate-100 bg-slate-50/50 p-6 transition-all hover:border-brand-200 hover:bg-brand-50/30 hover:shadow-lg hover:shadow-brand-500/5"
                >
                  <h3 className="text-lg font-semibold text-ink-900">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">{p.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="text-center text-sm font-semibold uppercase tracking-wider text-brand-600">
              What you get
            </p>
            <h2 className="mt-2 text-center font-display text-3xl font-semibold text-ink-950 sm:text-4xl">
              Everything the BRD demands — in one portal
            </h2>
            <div className="mt-14 grid gap-6 sm:grid-cols-2">
              {features.map((f) => (
                <article
                  key={f.title}
                  className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div
                    className={`mb-4 inline-flex w-fit rounded-lg bg-gradient-to-r ${f.accent} px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white`}
                  >
                    {f.phase}
                  </div>
                  <h3 className="text-xl font-semibold text-ink-900">{f.title}</h3>
                  <ul className="mt-4 flex-1 space-y-2.5">
                    {f.items.map((item) => (
                      <li key={item} className="flex gap-2 text-sm text-ink-600">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-8 rounded-2xl border border-dashed border-brand-300 bg-brand-50/50 px-6 py-5">
              {validations.map((v) => (
                <div key={v.label} className="text-center">
                  <p className="font-display text-2xl font-bold text-brand-700">{v.value}</p>
                  <p className="text-xs text-ink-600">{v.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="lifecycle"
          className="bg-ink-950 px-4 py-20 text-white sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center font-display text-3xl font-semibold sm:text-4xl">
              From draft to audit-ready report
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-slate-400">
              Four connected stages — no more offline review cycles.
            </p>
            <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {lifecycle.map((l) => (
                <li
                  key={l.step}
                  className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                >
                  <span className="font-display text-4xl font-bold text-brand-400/40">
                    {l.step}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold">{l.label}</h3>
                  <p className="mt-2 text-sm text-slate-400">{l.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="roles" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center font-display text-3xl font-semibold text-ink-950 sm:text-4xl">
              Built for every persona
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-center text-ink-600">
              Clearly differentiated access for employees, managers, and HR.
            </p>
            <ul className="mt-14 grid gap-6 lg:grid-cols-3">
              {roles.map((r) => (
                <li key={r.role} className={`rounded-2xl border p-6 ${r.color}`}>
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${r.badge}`}
                  >
                    {r.role}
                  </span>
                  <ul className="mt-5 space-y-3">
                    {r.duties.map((d) => (
                      <li key={d} className="flex gap-2 text-sm text-ink-700">
                        <Check className="h-4 w-4 shrink-0 text-brand-600" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="schedule"
          className="border-t border-slate-200/80 bg-white px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center font-display text-3xl font-semibold text-ink-950 sm:text-4xl">
              Enforced quarterly windows
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-center text-ink-600">
              The portal opens the right actions at the right time — goal setting in May,
              check-ins through the year, final capture in spring.
            </p>
            <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-brand-600 text-white">
                    <th className="px-4 py-3 font-semibold sm:px-6">Period</th>
                    <th className="px-4 py-3 font-semibold sm:px-6">Opens</th>
                    <th className="hidden px-4 py-3 font-semibold sm:table-cell sm:px-6">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((row, i) => (
                    <tr
                      key={row.period}
                      className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}
                    >
                      <td className="px-4 py-3.5 font-medium text-ink-900 sm:px-6">
                        {row.period}
                      </td>
                      <td className="px-4 py-3.5 text-brand-700 sm:px-6">{row.window}</td>
                      <td className="hidden px-4 py-3.5 text-ink-600 sm:table-cell sm:px-6">
                        {row.action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section
          id="sign-in"
          className="mx-4 mb-16 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-teal-500 px-6 py-16 text-center text-white shadow-2xl shadow-brand-700/30 sm:mx-6 lg:mx-auto lg:max-w-6xl"
        >
          <LogoMark className="mx-auto h-12 w-12 rounded-xl shadow-lg" />
          <h2 className="mt-6 font-display text-3xl font-semibold sm:text-4xl">
            Ready to align your organization?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-brand-100">
            Start with goal sheets that validate to 100%, flow through manager approval,
            and stay visible every quarter.
          </p>
          <Link
            to="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-brand-700 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Launch GoalFlow
            <ArrowRight />
          </Link>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 text-center text-sm text-ink-500 sm:px-6">
        <p>© {new Date().getFullYear()} GoalFlow — Goal Setting & Tracking Portal</p>
      </footer>
    </div>
  )
}
