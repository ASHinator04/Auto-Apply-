export function FieldLabel({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}
