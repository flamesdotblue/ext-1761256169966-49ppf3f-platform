import { BarChart3 } from 'lucide-react'

function dayLabel(d) {
  return d.toLocaleDateString(undefined, { weekday: 'short' })
}

export default function ActivityChart({ data, goal }) {
  const max = Math.max(goal, ...data.map((d) => d.steps)) || 1

  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-slate-300">
          <BarChart3 className="h-4 w-4 text-sky-400" />
          <h2 className="text-sm font-medium">Last 7 Days</h2>
        </div>
        <div className="text-xs text-slate-400">Goal: {goal.toLocaleString()}</div>
      </div>
      <div className="rounded-2xl bg-slate-800/60 p-4 ring-1 ring-white/10">
        <div className="flex h-40 items-end justify-between gap-2">
          {data.map((d) => {
            const pct = Math.min(1, d.steps / max)
            const color = d.steps >= goal ? 'bg-emerald-400' : 'bg-sky-400'
            return (
              <div key={d.key} className="flex w-full flex-col items-center">
                <div className="flex h-full w-full items-end">
                  <div
                    className={`w-full rounded-t-md ${color}`}
                    style={{ height: `${Math.max(4, pct * 100)}%` }}
                    title={`${d.steps} steps`}
                  />
                </div>
                <div className="mt-2 text-center text-[10px] text-slate-400">
                  <div>{dayLabel(d.date)}</div>
                  <div className="text-[10px] text-slate-500">{d.steps.toLocaleString()}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
