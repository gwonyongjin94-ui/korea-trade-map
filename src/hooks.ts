import { useEffect, useRef, useState } from 'react'
import type { ViewBox } from './geo'

/** Animate the view box towards a target with an ease-out curve. */
export function useAnimatedView(target: ViewBox): ViewBox {
  const [view, setView] = useState(target)
  const current = useRef(target)
  useEffect(() => {
    const from = current.current
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 600)
      const e = 1 - Math.pow(1 - t, 3)
      const next = from.map((v, i) => v + (target[i] - v) * e) as ViewBox
      current.current = next
      setView(next)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target])
  return view
}

const REDUCED = '(prefers-reduced-motion: reduce)'

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => typeof matchMedia === 'function' && matchMedia(REDUCED).matches)
  useEffect(() => {
    if (typeof matchMedia !== 'function') return
    const mq = matchMedia(REDUCED)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}
