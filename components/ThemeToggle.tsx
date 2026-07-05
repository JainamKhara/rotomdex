'use client'

import React from 'react'
import { useTheme } from './Providers'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="hover:bg-slate-100 dark:hover:bg-white/10 p-2.5 rounded-full transition-all cursor-pointer text-slate-600 dark:text-slate-300 hover:text-brand-red dark:hover:text-brand-red border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/40"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400" />
      )}
    </button>
  )
}
