export function MetricCard({
  label,
  value,
  subtext,
}: {
  label: string
  value: string
  subtext?: string
}) {
  return (
    <div className="border border-zinc-800 rounded-lg bg-black p-4 hover:border-zinc-700 transition-colors">
      <div className="text-sm text-zinc-500 font-medium mb-2">
        {label}
      </div>

      <div className="text-2xl font-semibold text-white mb-1">
        {value}
      </div>

      {subtext && (
        <div className="text-xs text-zinc-600">
          {subtext}
        </div>
      )}
    </div>
  )
}
