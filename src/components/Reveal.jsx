import { useEffect, useRef, useState } from 'react'

export function Reveal({ children, className = '', delay = 0, tag = 'section' }) {
  const Tag = tag
  const ref = useRef(null)
  const supportsObserver =
    typeof window !== 'undefined' && typeof window.IntersectionObserver !== 'undefined'
  const [isVisible, setIsVisible] = useState(!supportsObserver)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const element = ref.current

    if (!element || !supportsObserver) {
      return undefined
    }

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return
        }

        setIsVisible(true)
        observer.unobserve(entry.target)
      },
      {
        threshold: 0.18,
      },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [supportsObserver])

  return (
    <Tag
      ref={ref}
      className={`reveal${isVisible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}
      style={{ '--reveal-delay': `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}
