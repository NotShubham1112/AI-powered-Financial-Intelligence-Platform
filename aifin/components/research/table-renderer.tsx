"use client"

export function TableRenderer({ data }: { data: any }) {
  if (!data || !data.rows || data.rows.length === 0) {
    return <div className="text-zinc-500">No data available</div>
  }

  const columns = data.columns || Object.keys(data.rows[0])

  return (
    <div className="border border-zinc-800 rounded-lg bg-black p-4 mb-6 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800">
            {columns.map((col: string) => (
              <th
                key={col}
                className="text-left py-3 px-4 text-zinc-300 font-semibold"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row: any, idx: number) => (
            <tr
              key={idx}
              className="border-b border-zinc-800 hover:bg-zinc-900/50"
            >
              {columns.map((col: string) => (
                <td key={`${idx}-${col}`} className="py-3 px-4 text-zinc-400">
                  {row[col] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
