type Point = { label: string; value: number };

export function SalesChart({ data }: { data: Point[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="border border-[#ddd5ca] bg-[#fffdfa] p-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium tracking-[0.22em] text-[#8a7453] uppercase">Sales Analytics</p>
          <h2 className="mt-2 font-display text-3xl text-[#292521]">Revenue trend</h2>
        </div>
      </div>
      {data.length === 0 ? (
        <p className="mt-8 text-sm text-[#6e6861]">No sales data yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-6 gap-3 sm:gap-4">
          {data.map((d) => (
            <div key={d.label} className="flex flex-col items-center gap-2">
              <div className="flex h-44 w-full items-end bg-[#f3ede4] px-1 sm:px-2">
                <div
                  className="w-full bg-[#a88755] transition-all"
                  style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }}
                  title={`${d.label}: ₹${d.value.toLocaleString("en-IN")}`}
                />
              </div>
              <span className="text-[10px] tracking-[0.08em] text-[#6e6861] uppercase">{d.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}