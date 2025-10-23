import { Activity, Home, Settings } from 'lucide-react'

export default function FooterNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md border-t border-white/10 bg-slate-900/80 px-6 py-3 backdrop-blur">
      <div className="flex items-center justify-around">
        <button className="flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-xs text-slate-300 transition hover:text-white">
          <Home className="h-5 w-5" />
          Home
        </button>
        <button className="flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-xs text-white">
          <Activity className="h-5 w-5" />
          Track
        </button>
        <button className="flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-xs text-slate-300 transition hover:text-white" onClick={() => alert('Settings coming soon!')}>
          <Settings className="h-5 w-5" />
          Settings
        </button>
      </div>
    </nav>
  )
}
