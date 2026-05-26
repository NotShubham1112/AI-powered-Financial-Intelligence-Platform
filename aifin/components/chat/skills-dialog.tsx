"use client"

import * as React from "react"
import {
  Search,
  Puzzle,
  Download,
  CheckCircle2,
  Settings,
  Link2,
  Blocks,
  ArrowUpDown,
  X
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Skill {
  id: string
  name: string
  description: string
  author: string
  installs: string
  category: string
  installed: boolean
}

interface SkillsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const mockSkills = [
  { id: "earnings", name: "/earnings", description: "Analyze SEC filings and earnings call transcripts in real-time.", author: "FININTEL", installs: "814.9K", category: "Analysis", installed: true },
  { id: "risk", name: "/risk", description: "Evaluate portfolio exposure, factor risk, and historical stress tests.", author: "FININTEL", installs: "508.3K", category: "Portfolio", installed: true },
  { id: "portfolio", name: "/portfolio", description: "Build, optimize, and backtest multi-asset allocation strategies.", author: "FININTEL", installs: "414.5K", category: "Portfolio", installed: true },
  { id: "market-analysis", name: "/market-analysis", description: "Generate comprehensive macroeconomic and sector overviews.", author: "FININTEL", installs: "362.9K", category: "Analysis", installed: true },
  { id: "compare", name: "/compare", description: "Side-by-side performance and valuation comparisons of equities.", author: "FININTEL", installs: "280.3K", category: "Analysis", installed: false },
  { id: "crypto", name: "/crypto", description: "Real-time cryptocurrency sentiment, liquidity flows, and orderbook data.", author: "FININTEL", installs: "272.5K", category: "Alternative", installed: false },
  { id: "macro", name: "/macro", description: "Track key macroeconomic indicators and federal reserve policies.", author: "FININTEL", installs: "194.2K", category: "Analysis", installed: false },
]

export function SkillsDialog({ open, onOpenChange }: SkillsDialogProps) {
  const [search, setSearch] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<"skills" | "connectors" | "plugins">("skills")
  const [activeCategory, setActiveCategory] = React.useState("all")
  const [sortBy, setSortBy] = React.useState<"popular" | "alphabetical">("popular")

  const filteredSkills = React.useMemo(() => {
    return mockSkills
      .filter((s) => {
        const matchesSearch =
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.description.toLowerCase().includes(search.toLowerCase())

        const matchesCategory =
          activeCategory === "all"
            ? true
            : activeCategory === "installed"
            ? s.installed
            : s.category.toLowerCase() === activeCategory.toLowerCase()

        return matchesSearch && matchesCategory
      })
      .sort((a, b) => {
        if (sortBy === "alphabetical") {
          return a.name.localeCompare(b.name)
        }
        // "popular" sort based on installs count (descending)
        const parseInstalls = (str: string) => parseFloat(str.replace("K", ""))
        return parseInstalls(b.installs) - parseInstalls(a.installs)
      })
  }, [search, activeCategory, sortBy])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        showCloseButton={false}
        className="sm:max-w-[900px] w-full max-h-[85vh] h-[650px] border border-border bg-background p-0 shadow-2xl sm:rounded-xl overflow-hidden gap-0"
      >
        <DialogTitle className="sr-only">Directory</DialogTitle>
        <div className="flex h-full w-full">
          {/* Left Sidebar */}
          <div className="w-[220px] flex-shrink-0 border-r border-border bg-muted/20 flex flex-col justify-between">
            <div>
              <div className="flex h-14 items-center px-5 border-b border-border/40 justify-between">
                <span className="font-semibold text-foreground tracking-tight text-base">
                  Directory
                </span>
              </div>
              <div className="p-3 space-y-1">
                {[
                  { id: "skills", label: "Skills", icon: Puzzle },
                  { id: "connectors", label: "Connectors", icon: Link2, badge: "soon" },
                  { id: "plugins", label: "Plugins", icon: Blocks, badge: "soon" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => item.badge !== "soon" && setActiveTab(item.id as "skills" | "connectors" | "plugins")}
                    className={cn(
                      "w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all",
                      activeTab === item.id
                        ? "bg-accent text-foreground font-medium border border-border/40"
                        : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
                      item.badge === "soon" && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-border/30 bg-muted/50 text-muted-foreground/80 scale-90">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            {/* Footer-like element inside sidebar */}
            <div className="p-4 border-t border-border/40">
              <div className="text-[10px] font-mono text-muted-foreground/50">
                FININTEL CORE v1.0.2
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 bg-background relative">
            {/* Header / Search Area */}
            <div className="flex h-14 items-center justify-between border-b border-border/40 px-6 gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  placeholder="Search skills..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 border-border bg-accent/10 pl-9 rounded-lg focus-visible:ring-0 focus-visible:border-border/100 transition-colors placeholder:text-muted-foreground/45 text-sm"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground border border-transparent hover:border-border rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {activeTab === "skills" ? (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Filter and sorting controls */}
                <div className="flex flex-wrap items-center justify-between px-6 py-3 border-b border-border/30 gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase bg-accent text-foreground border border-border/40">
                      FININTEL & Partners
                    </Badge>
                  </div>
                  
                  {/* Category Filter Pills & Sort Dropdown */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 border border-border/50 rounded-lg p-0.5 bg-accent/20">
                      {[
                        { id: "all", label: "All" },
                        { id: "installed", label: "Active" },
                        { id: "analysis", label: "Analysis" },
                        { id: "portfolio", label: "Portfolio" },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id)}
                          className={cn(
                            "px-2.5 py-1 text-xs rounded-md transition-all font-mono uppercase tracking-wider",
                            activeCategory === cat.id
                              ? "bg-background text-foreground shadow-sm border border-border/40"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    <div className="h-4 w-px bg-border/50" />

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ArrowUpDown className="h-3 w-3" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as "popular" | "alphabetical")}
                        className="bg-transparent text-foreground hover:text-primary outline-none cursor-pointer font-mono uppercase tracking-wider text-[11px]"
                      >
                        <option value="popular">Popular</option>
                        <option value="alphabetical">A-Z</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Grid container */}
                <ScrollArea className="flex-1 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
                    {filteredSkills.length === 0 ? (
                      <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center">
                        <Puzzle className="h-10 w-10 text-muted-foreground/20 mb-3 animate-pulse" />
                        <p className="text-sm font-medium text-foreground/75">No skills matching criteria</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Try resetting your filters or search query.</p>
                      </div>
                    ) : (
                      filteredSkills.map((skill) => (
                        <SkillCard key={skill.id} skill={skill} />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <Blocks className="h-12 w-12 text-muted-foreground/20 mb-3" />
                <h3 className="text-sm font-semibold text-foreground">Coming Soon</h3>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  Connectors and plugins will be available in future releases to expand FININTEL&apos;s orchestration layers.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SkillCard({ skill }: { skill: Skill }) {
  const [installed, setInstalled] = React.useState(skill.installed)

  return (
    <div className="group flex flex-col justify-between rounded-xl border border-border bg-accent/10 p-4.5 transition-all hover:bg-accent/20 hover:border-border relative overflow-hidden">
      <div>
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <code className="font-mono text-sm font-semibold text-foreground tracking-tight">
              {skill.name}
            </code>
          </div>
          <button 
            className="text-muted-foreground/40 hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent/40"
            title="Configure settings"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3 text-[11px] text-muted-foreground/60 font-mono">
          <span>{skill.author}</span>
          <span>•</span>
          <span>{skill.installs} installs</span>
          {installed && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 text-foreground font-medium text-[10px] uppercase tracking-wider">
                <CheckCircle2 className="h-2.5 w-2.5" />
                Active
              </span>
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-2 mb-4">
          {skill.description}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-border/30 pt-3 mt-auto">
        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-border/40 bg-accent/40 text-muted-foreground/70">
          {skill.category}
        </span>
        
        <Button
          variant={installed ? "outline" : "default"}
          size="sm"
          onClick={() => setInstalled(!installed)}
          className={cn(
            "h-7 px-3 text-[11px] font-mono uppercase tracking-wider rounded-md transition-all",
            installed 
              ? "border-border/60 bg-transparent text-muted-foreground hover:bg-accent/40" 
              : "bg-foreground text-background hover:opacity-90"
          )}
        >
          {installed ? (
            "Uninstall"
          ) : (
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              Install
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
