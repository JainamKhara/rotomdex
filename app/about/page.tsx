import React from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'

export const metadata = {
  title: 'About RotomDex',
  description: 'About the RotomDex project and its creator Jainam.',
}

// Icons pulled straight from cdn.simpleicons.org — official brand SVGs
const techStack = [
  {
    name: 'Next.js 16',
    desc: 'App Router · SSR · RSC',
    iconSrc: 'https://cdn.simpleicons.org/nextdotjs/ffffff',
    bg: 'bg-black',
  },
  {
    name: 'React 19',
    desc: 'Hooks · Suspense · Server',
    iconSrc: 'https://cdn.simpleicons.org/react/61DAFB',
    bg: 'bg-[#20232a]',
  },
  {
    name: 'TypeScript',
    desc: 'Strict · Typed · Safe',
    iconSrc: 'https://cdn.simpleicons.org/typescript/ffffff',
    bg: 'bg-[#3178C6]',
  },
  {
    name: 'Tailwind CSS',
    desc: 'Utility-first · v4',
    iconSrc: 'https://cdn.simpleicons.org/tailwindcss/38BDF8',
    bg: 'bg-[#0f172a]',
  },
  {
    name: 'Prisma ORM',
    desc: 'Type-safe · Migrations',
    iconSrc: 'https://cdn.simpleicons.org/prisma/ffffff',
    bg: 'bg-[#0c344b]',
  },
  {
    name: 'PostgreSQL',
    desc: 'Neon · Serverless DB',
    iconSrc: 'https://cdn.simpleicons.org/postgresql/ffffff',
    bg: 'bg-[#336791]',
  },
  {
    name: 'TanStack Query',
    desc: 'Caching · Sync · Async',
    iconSrc: 'https://cdn.simpleicons.org/reactquery/FF4154',
    bg: 'bg-[#1a1a2e]',
  },
  {
    name: 'Framer Motion',
    desc: 'Animations · Gestures',
    iconSrc: 'https://cdn.simpleicons.org/framer/ffffff',
    bg: 'bg-[#0055FF]',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0a0f] text-slate-900 dark:text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 h-[68px] w-full bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/[0.06]">
        <div className="flex items-center justify-between h-full max-w-7xl mx-auto px-6">
          <Logo />
          <ul className="hidden md:flex gap-1 items-center h-full">
            {[['Home', '/'], ['Pokédex', '/pokedex'], ['Compare', '/compare'], ['Teams', '/teams'], ['About', '/about']].map(([label, href]) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    href === '/about'
                      ? 'text-brand-red bg-brand-red/10'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <ThemeToggle />
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 flex flex-col gap-5">

        {/* Row 1: Project Card + Creator Card */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Project — spans 3 cols */}
          <div className="lg:col-span-3 bg-white dark:bg-[#111118] border border-slate-200/70 dark:border-white/[0.07] rounded-2xl p-7 flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase block mb-2">Open Source Project</span>
                <h1 className="text-3xl font-black tracking-tight leading-[1.1]">
                  Rotom<span className="text-brand-red">Dex</span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-mono">v1.0 · 2025</p>
              </div>
              {/* Pokéball accent */}
              <div className="shrink-0 w-14 h-14 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/[0.07]">
                <svg viewBox="0 0 100 100" className="w-8 h-8">
                  <circle cx="50" cy="50" r="48" fill="white" stroke="#ddd" strokeWidth="4"/>
                  <path d="M2 50h96" stroke="#222" strokeWidth="4"/>
                  <path d="M2 50C2 23.5 23.5 2 50 2S98 23.5 98 50" fill="#E3350D"/>
                  <circle cx="50" cy="50" r="14" fill="white" stroke="#222" strokeWidth="4"/>
                  <circle cx="50" cy="50" r="6" fill="#222"/>
                </svg>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              A competitive-grade Pokédex built for trainers who think in data. Search and filter all 1,025 Pokémon across 9 generations, compare stats head-to-head, build teams with live type-coverage analysis, and test your eye with a silhouette quiz — all from one fast, responsive interface.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Pokémon', value: '1,025' },
                { label: 'Generations', value: 'Gen 1–9' },
                { label: 'Query (warm)', value: '~0.1ms' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] rounded-xl p-3">
                  <span className="text-[9px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase block">{label}</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white leading-tight">{value}</span>
                </div>
              ))}
            </div>

            {/* Feature tags */}
            <div className="flex flex-wrap gap-2">
              {['Pokédex', 'Compare', 'Team Builder', 'Silhouette Quiz', 'Dark Mode', 'Type Coverage'].map(tag => (
                <span key={tag} className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/7">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Creator — spans 2 cols */}
          <div className="lg:col-span-2 bg-white dark:bg-[#111118] border border-slate-200/70 dark:border-white/7 rounded-2xl p-7 flex flex-col justify-between gap-6">
            <div>
              <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase block mb-3">Creator</span>

              {/* Avatar ring */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-linear-to-br from-brand-red to-orange-500 flex items-center justify-center text-white text-xl font-black select-none shadow-lg">
                  J
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">Jainam</h2>
                  <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-0.5">Full-Stack Developer</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Passionate about building high-performance, data-driven web apps with clean UI. RotomDex started as a personal project to combine my love for Pokémon with modern web engineering.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex flex-col gap-2">
              <a
                href="https://github.com/JainamKhara"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-200/60 dark:border-white/7 hover:border-slate-400 dark:hover:border-white/20 transition-all group"
              >
                <svg className="w-4 h-4 fill-current text-slate-700 dark:text-slate-300 shrink-0" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">GitHub</span>
                <span className="ml-auto text-[10px] font-mono text-slate-400">github.com/JainamKhara</span>
              </a>

              <a
                href="https://linkedin.com/in/jainamkhara"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-200/60 dark:border-white/7 hover:border-[#0A66C2]/40 dark:hover:border-[#0A66C2]/40 transition-all group"
              >
                <svg className="w-4 h-4 fill-[#0A66C2] shrink-0" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">LinkedIn</span>
                <span className="ml-auto text-[10px] font-mono text-slate-400">linkedin.com/in/jainamkhara</span>
              </a>

              <a
                href="https://jainamkhara.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-200/60 dark:border-white/7 hover:border-brand-red/30 dark:hover:border-brand-red/30 transition-all group"
              >
                <svg className="w-4 h-4 text-brand-red shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 1 0 20A14.5 14.5 0 0 1 12 2" />
                  <path d="M2 12h20" />
                </svg>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Portfolio</span>
                <span className="ml-auto text-[10px] font-mono text-slate-400">jainamkhara.app</span>
              </a>
            </div>
          </div>
        </div>

        {/* Row 2: Tech Stack */}
        <div className="bg-white dark:bg-[#111118] border border-slate-200/70 dark:border-white/7 rounded-2xl p-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase block">Built With</span>
              <h2 className="text-lg font-black tracking-tight mt-0.5">Technology Stack</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {techStack.map(({ name, desc, iconSrc, bg }) => (
              <div
                key={name}
                className="flex flex-col items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-200/60 dark:border-white/6 hover:border-slate-300 dark:hover:border-white/12 transition-all text-center group cursor-default"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={iconSrc} alt={name} className="w-5 h-5 object-contain" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-slate-800 dark:text-white block leading-tight">{name}</span>
                  <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 block mt-0.5 leading-tight">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-white/6 py-5 px-6 text-center">
        <p className="text-[11px] text-slate-400 dark:text-slate-600">
          Data by{' '}
          <a href="https://pokeapi.co" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors underline underline-offset-2">
            PokéAPI
          </a>
          {' '}· Pokémon © Nintendo / Game Freak
        </p>
      </footer>
    </div>
  )
}
