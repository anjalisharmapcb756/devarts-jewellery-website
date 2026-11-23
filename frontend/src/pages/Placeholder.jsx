export default function Placeholder({ title }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-5xl">{title}</h1>
      <p className="mt-4 text-muted">This page is being migrated to the new Vite + React frontend. Core functionality will be connected to the Express API.</p>
    </div>
  );
}
