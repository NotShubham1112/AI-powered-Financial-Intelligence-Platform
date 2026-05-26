"use client"

import {
  Card,
  CardContent,
} from "@/components/ui/card"

export function TableRenderer({ data }: { data: any }) {
  if (!data) {
    return <div className="flex h-[100px] items-center justify-center text-sm text-zinc-500">No data available</div>
  }

  const rows = data.rows || data
  if (!Array.isArray(rows) || rows.length === 0) {
    return <div className="flex h-[100px] items-center justify-center text-sm text-zinc-500">No data available</div>
  }

  const columns = data.columns || (typeof rows[0] === "object" && rows[0] !== null ? Object.keys(rows[0]) : [])

  if (columns.length === 0) {
    return <div className="flex h-[100px] items-center justify-center text-sm text-zinc-500">No data available</div>
  }

  return (
    <Card className="border-zinc-800">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {columns.map((col: string) => (
                  <th
                    key={col}
                    className="text-left py-3 px-4 text-muted-foreground font-medium"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any, idx: number) => (
                <tr
                  key={idx}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  {columns.map((col: string) => (
                    <td key={`${idx}-${col}`} className="py-3 px-4 text-muted-foreground">
                      {row[col] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
