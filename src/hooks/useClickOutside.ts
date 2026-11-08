import { useEffect, useRef, RefObject } from 'react'

/**
 * Custom hook that fires a callback when clicking outside the referenced element.
 * Supports MouseEvent ('mousedown') and TouchEvent ('touchstart').
 *
 * @param handler Callback to execute when a click occurs outside
 * @param enabled Whether the outside click listener is active
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
): RefObject<T> {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!enabled) return

    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current
      if (!el || el.contains((event.target as Node) || null)) {
        return
      }
      handler(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [handler, enabled])

  return ref
}
