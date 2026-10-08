'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ThemeCtx { dark: boolean; toggleTheme: () => void }
const ThemeContext = createContext<ThemeCtx>({ dark: false, toggleTheme: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(true) // Default dark to match the pre-hydration script
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('vle-theme')
    const sys = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = saved === 'dark' || saved === null
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggleTheme = () => setDark(prev => {
    const next = !prev
    localStorage.setItem('vle-theme', next ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', next)
    return next
  })

  return <ThemeContext.Provider value={{ dark, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
