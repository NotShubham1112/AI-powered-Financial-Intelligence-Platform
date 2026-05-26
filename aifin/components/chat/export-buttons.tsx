"use client"

import { FileDown, FileSpreadsheet, ExternalLink } from "lucide-react"
import { TerminalButton } from "@/design-system/components"
import { MetadataLabel } from "@/design-system/components"

interface ExportButtonsProps {
  onExportCSV?: () => void
  onExportXLSX?: () => void
  onExportSheets?: () => void
}

export function ExportButtons({ onExportCSV, onExportXLSX, onExportSheets }: ExportButtonsProps) {
  return (
    <div className="mt-4 flex items-center gap-3 border-t border-border pt-3">
      <MetadataLabel>export</MetadataLabel>
      <div className="flex items-center gap-1">
        {onExportCSV && (
          <TerminalButton size="sm" variant="ghost" onClick={onExportCSV} className="h-7 gap-1.5 px-2">
            <FileDown className="h-3 w-3" />
            csv
          </TerminalButton>
        )}
        {onExportXLSX && (
          <TerminalButton size="sm" variant="ghost" onClick={onExportXLSX} className="h-7 gap-1.5 px-2">
            <FileSpreadsheet className="h-3 w-3" />
            xlsx
          </TerminalButton>
        )}
        {onExportSheets && (
          <TerminalButton size="sm" variant="ghost" onClick={onExportSheets} className="h-7 gap-1.5 px-2">
            <ExternalLink className="h-3 w-3" />
            sheets
          </TerminalButton>
        )}
      </div>
    </div>
  )
}
