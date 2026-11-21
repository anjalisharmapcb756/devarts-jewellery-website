type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="border border-[#ddd5ca] bg-[#fffdfa] p-6">
      <p className="text-[11px] font-medium tracking-[0.22em] text-[#8a7453] uppercase">{label}</p>
      <p className="mt-3 font-display text-4xl tracking-tight text-[#292521]">{value}</p>
      {hint ? <p className="mt-2 text-sm text-[#6e6861]">{hint}</p> : null}
    </div>
  );
}