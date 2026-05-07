import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

export function useCountUp(target, duration = 1.4) {
  const ref = useRef(null)
  const [count, setCount] = useState(0)
  const isInView = useInView(ref, { once: true, amount: 0.4 })

  useEffect(() => {
    if (!isInView) return

    let start = 0
    const totalFrames = Math.max(Math.round(duration * 60), 1)
    const increment = target / totalFrames

    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
        return
      }
      setCount(Math.floor(start))
    }, 1000 / 60)

    return () => clearInterval(timer)
  }, [duration, isInView, target])

  return { ref, count }
}
