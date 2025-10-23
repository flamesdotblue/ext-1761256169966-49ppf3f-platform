import { useEffect, useRef, useState } from 'react'
import { Minus, Plus, Target, Pause, Play, RefreshCw } from 'lucide-react'
import ProgressRing from './ProgressRing'

function formatPercent(x) {
  return Math.round(x * 100)
}

export default function StepCounter({ steps, setSteps, goal, setGoal }) {
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState(String(goal))
  const [motionEnabled, setMotionEnabled] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('motionEnabled') || 'false')
    } catch {
      return false
    }
  })
  const [tracking, setTracking] = useState(false)

  const lastStepAtRef = useRef(0)
  const lastMagRef = useRef(0)
  const rafRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('motionEnabled', JSON.stringify(motionEnabled))
  }, [motionEnabled])

  useEffect(() => {
    if (!motionEnabled || !tracking) return

    let listener
    let cleanup

    const setup = async () => {
      const DM = window.DeviceMotionEvent
      if (!DM) {
        console.warn('DeviceMotion not supported')
        return
      }
      if (typeof DM.requestPermission === 'function') {
        try {
          const res = await DM.requestPermission()
          if (res !== 'granted') return
        } catch {
          return
        }
      }

      const cooldownMs = 350
      const threshold = 12 // m/s^2 magnitude (approx 1.2g over gravity / spikes)

      listener = (ev) => {
        const a = ev.accelerationIncludingGravity || ev.acceleration
        if (!a) return
        const ax = a.x || 0
        const ay = a.y || 0
        const az = a.z || 0
        const mag = Math.sqrt(ax * ax + ay * ay + az * az)
        const now = Date.now()

        // Simple peak detection with cooldown and rising edge
        const rising = mag > threshold && lastMagRef.current <= threshold
        const cooled = now - lastStepAtRef.current > cooldownMs
        if (rising && cooled) {
          lastStepAtRef.current = now
          setSteps((s) => s + 1)
        }
        lastMagRef.current = mag
      }

      window.addEventListener('devicemotion', listener, { passive: true })

      cleanup = () => {
        window.removeEventListener('devicemotion', listener)
      }
    }

    setup()

    return () => {
      if (cleanup) cleanup()
    }
  }, [motionEnabled, tracking, setSteps])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const progress = Math.min(1, steps / Math.max(1, goal))

  const requestMotion = async () => {
    const DM = window.DeviceMotionEvent
    if (!DM) return alert('Motion sensors not supported on this device')
    if (typeof DM.requestPermission === 'function') {
      try {
        const res = await DM.requestPermission()
        if (res !== 'granted') return
      } catch (e) {
        return
      }
    }
    setMotionEnabled(true)
    setTracking(true)
  }

  const onSaveGoal = () => {
    const n = parseInt(goalInput, 10)
    if (Number.isFinite(n) && n > 0) {
      setGoal(n)
      setEditingGoal(false)
    }
  }

  return (
    <section className="mt-2">
      <div className="rounded-2xl bg-slate-800/60 p-4 ring-1 ring-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300">
            <Target className="h-4 w-4 text-sky-400" />
            {!editingGoal ? (
              <button
                className="text-left text-sm hover:text-white"
                onClick={() => {
                  setGoalInput(String(goal))
                  setEditingGoal(true)
                }}
              >
                Daily Goal: <span className="font-semibold text-white">{goal.toLocaleString()}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  className="w-24 rounded-md border border-white/10 bg-slate-900 px-2 py-1 text-sm outline-none ring-1 ring-inset ring-white/10 focus:border-sky-400 focus:ring-sky-400"
                  inputMode="numeric"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value.replace(/[^0-9]/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && onSaveGoal()}
                />
                <button
                  className="rounded-md bg-sky-500/90 px-2 py-1 text-xs font-medium text-white hover:bg-sky-500"
                  onClick={onSaveGoal}
                >
                  Save
                </button>
              </div>
            )}
          </div>
          <div className="text-right text-xs text-slate-400">
            {formatPercent(progress)}% of goal
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 items-center gap-4">
          <div className="relative mx-auto">
            <ProgressRing size={180} stroke={12} progress={progress} />
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="text-4xl font-semibold tracking-tight text-white">{steps.toLocaleString()}</div>
                <div className="text-xs uppercase tracking-wider text-slate-400">steps</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-xl bg-slate-900/60 p-2 ring-1 ring-white/10">
              <button
                className="rounded-lg bg-slate-800 p-2 text-slate-200 transition hover:bg-slate-700 active:scale-95"
                onClick={() => setSteps(steps - 1)}
                aria-label="Remove step"
              >
                <Minus className="h-5 w-5" />
              </button>
              <button
                className="rounded-lg bg-sky-500 px-4 py-2 font-medium text-white shadow hover:bg-sky-400 active:scale-95"
                onClick={() => setSteps(steps + 1)}
              >
                Add Step
              </button>
              <button
                className="rounded-lg bg-slate-800 p-2 text-slate-200 transition hover:bg-slate-700 active:scale-95"
                onClick={() => setSteps(0)}
                aria-label="Reset"
                title="Reset today"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl bg-slate-900/60 p-3 ring-1 ring-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Motion Tracking</div>
                  <div className="text-xs text-slate-400">Use device motion to auto-count steps</div>
                </div>
                {!motionEnabled ? (
                  <button
                    className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-400 active:scale-95"
                    onClick={requestMotion}
                  >
                    Enable
                  </button>
                ) : (
                  <button
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition active:scale-95 ${tracking ? 'bg-rose-500 text-white hover:bg-rose-400' : 'bg-emerald-500 text-white hover:bg-emerald-400'}`}
                    onClick={() => setTracking((t) => !t)}
                  >
                    {tracking ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {tracking ? 'Pause' : 'Start'}
                  </button>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                For best results, keep your phone in a pocket while walking. Accuracy may vary by device and browser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
