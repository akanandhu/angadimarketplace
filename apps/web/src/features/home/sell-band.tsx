import { SellButton } from '@/components/layout/sell-button';

const STEPS = [
  'Add photos, price and the car’s details. Listing is free.',
  'Buyers send you a contact request from the listing.',
  'You choose who gets your number. Everyone else just sees the car.',
];

/** Seller pitch as the real three-step contact flow, beside the Sell action. */
export function SellBand() {
  return (
    <section aria-labelledby="sell-heading" className="bg-gold-soft py-12 md:py-16">
      <div className="mx-auto grid max-w-[1320px] gap-8 px-4 md:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-end">
        <div className="space-y-5">
          <h2
            id="sell-heading"
            className="max-w-[16ch] text-[clamp(2rem,3vw+1rem,3.25rem)] leading-none font-bold"
          >
            Selling a car? Keep your number to yourself.
          </h2>
          <SellButton label="Sell your car" className="h-12 px-6 text-base" />
        </div>
        <ol className="grid gap-5 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step} className="space-y-2 rounded-card bg-surface p-5 shadow-card">
              <span className="price flex size-9 items-center justify-center rounded-full bg-gold text-lg">
                {index + 1}
              </span>
              <p className="text-[15px] leading-relaxed text-ink-soft">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
