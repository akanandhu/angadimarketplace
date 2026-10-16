/** Reserved, clearly labelled ad space. Must never look like a listing or a contact CTA. */
export function AdSlot({ className = '' }: { className?: string }) {
  return (
    <aside
      aria-label="Advertisement"
      className={`flex h-24 items-center justify-center rounded-card border border-dashed border-line-strong bg-canvas text-xs tracking-widest text-muted uppercase ${className}`}
    >
      Advertisement
    </aside>
  );
}
