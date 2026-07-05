import React from 'react'
import Link from 'next/link'

interface LogoProps {
  className?: string
  iconOnly?: boolean
}

export function Logo({ className = "", iconOnly = false }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 select-none cursor-pointer group ${className}`}>
      {/* CSS PokeBall Icon */}
      <div className="w-5 h-5 rounded-full border border-slate-900 dark:border-white relative overflow-hidden bg-white flex flex-col justify-between items-center rotate-[-15deg] group-hover:rotate-15 transition-transform duration-300 shadow-sm shrink-0">
        <div className="w-full h-[9px] bg-brand-red border-b border-slate-900 dark:border-white" />
        <div className="absolute top-[9px] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full border border-slate-900 dark:border-white bg-white z-10" />
        <div className="w-full h-[9px] bg-white" />
      </div>
      
      {!iconOnly && (
        <div className="flex items-center text-xl tracking-tight">
          <span className="logo-rotom transition-colors group-hover:text-brand-red">Rotom</span>
          <span className="logo-dex -ml-0.5">Dex</span>
        </div>
      )}
    </Link>
  )
}
