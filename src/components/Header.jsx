import { Activity, Settings } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-10 -mx-4 mb-4 flex items-center justify-between bg-gradient-to-b from-slate-900/90 to-slate-900/40 px-4 py-4 backdrop-blur">
      <div className="flex items-center gap-2">
        <div className="rounded-xl bg-sky-500/10 p-2 ring-1 ring-sky-400/20">
          <Activity className="h-5 w-5 text-sky-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Step Tracker</h1>
          <p className="text-xs text-slate-400">Move a little. Feel a lot better.</p>
        </div>
      </div>
      <button
        type="button"
        aria-label="Settings"
        className="rounded-lg p-2 text-slate-300 transition hover:bg-white/5 hover:text-white"
        onClick={() => alert('Settings coming soon!')}
      >
        <Settings className="h-5 w-5" />
      </button>
    </header>
  )
}
