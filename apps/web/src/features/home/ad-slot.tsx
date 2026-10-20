/** Reserved, clearly labelled ad space. Must never look like a listing or a contact CTA. */
export function AdSlot({ className = '' }: { className?: string }) {
  return (
    <aside
      aria-label="Advertisement"
      className={`flex h-24 items-center justify-center border-y border-dashed border-line-strong text-[11px] tracking-[0.2em] text-muted uppercase ${className}`}
    >
      Advertisement
    </aside>
  );
}
