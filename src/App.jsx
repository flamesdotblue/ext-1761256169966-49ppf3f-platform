import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import StepCounter from './components/StepCounter'
import ActivityChart from './components/ActivityChart'
import FooterNav from './components/FooterNav'

function getTodayKey() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function loadHistory() {
  try {
    const raw = localStorage.getItem('stepHistory')
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed ? parsed : {}
  } catch {
    return {}
  }
}

function saveHistory(history) {
  localStorage.setItem('stepHistory', JSON.stringify(history))
}

function loadGoal() {
  const raw = localStorage.getItem('stepGoal')
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : 8000
}

function saveGoal(n) {
  localStorage.setItem('stepGoal', String(n))
}

export default function App() {
  const [history, setHistory] = useState(() => loadHistory())
  const [goal, setGoal] = useState(() => loadGoal())

  const todayKey = getTodayKey()
  const todaySteps = history[todayKey] || 0

  const setTodaySteps = (val) => {
    setHistory((prev) => {
      const next = { ...prev, [todayKey]: Math.max(0, val | 0) }
      saveHistory(next)
      return next
    })
  }

  useEffect(() => {
    const id = setInterval(() => {
      const key = getTodayKey()
      setHistory((prev) => {
        if (prev[key] == null) {
          const next = { ...prev, [key]: 0 }
          saveHistory(next)
          return next
        }
        return prev
      })
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    saveGoal(goal)
  }, [goal])

  const last7Days = useMemo(() => {
    const arr = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const key = `${yyyy}-${mm}-${dd}`
      arr.push({ key, steps: history[key] || 0, date: d })
    }
    return arr
  }, [history])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white">
      <div className="mx-auto max-w-md px-4 pb-24">
        <Header />
        <main>
          <StepCounter
            steps={todaySteps}
            setSteps={setTodaySteps}
            goal={goal}
            setGoal={setGoal}
          />
          <ActivityChart data={last7Days} goal={goal} />
        </main>
      </div>
      <FooterNav />
    </div>
  )
}
