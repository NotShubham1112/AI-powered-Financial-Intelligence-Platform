"use client"

import Link from "next/link"
import { Terminal, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

const navLinks = [
  { label: "Research", href: "#research" },
  { label: "Capabilities", href: "#markets" },
  { label: "MCP", href: "#mcp" },
  { label: "Start", href: "#getting-started" },
  { label: "FAQ", href: "#docs" },
]

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // eslint-disable-next-line
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-8 w-8" />

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-3.5 w-3.5" />
      ) : (
        <Moon className="h-3.5 w-3.5" />
      )}
    </button>
  )
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-foreground">
            FININTEL
          </span>
        </Link>

        {/* Center nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[13px] tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 border border-border px-4 py-1.5 text-[13px] text-foreground transition-colors hover:bg-accent"
          >
            <Terminal className="h-3.5 w-3.5" />
            Launch Terminal
          </Link>
        </div>
      </div>
    </header>
  )
}
