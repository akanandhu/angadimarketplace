import { Plate } from '@/components/ui/plate';
import type { PublicCar } from '@/lib/api/types';
import { formatKm, label, ordinalOwner } from '@/lib/format';

/** Spec sheet: year / KM / fuel / transmission / ownership / RTO. Registration is shown as RTO only. */
export function VehicleOverview({ car }: { car: PublicCar }) {
  const items = [
    { name: 'Year', value: String(car.manufacturingYear) },
    { name: 'KM driven', value: formatKm(car.kmDriven) },
    { name: 'Fuel', value: label(car.fuelType) },
    { name: 'Transmission', value: label(car.transmission) },
    { name: 'Ownership', value: ordinalOwner(car.numberOfOwners) },
  ];
  return (
    <section
      aria-labelledby="overview-heading"
      className="rounded-card border border-line bg-surface p-4 md:p-5"
    >
      <h2 id="overview-heading" className="mb-4 text-lg font-bold">
        Vehicle overview
      </h2>
      <dl className="grid grid-cols-2 border-t border-l border-line sm:grid-cols-3">
        {items.map(({ name, value }) => (
          <div key={name} className="border-r border-b border-line px-3 py-3">
            <dt className="text-[11px] font-medium tracking-[0.08em] text-muted uppercase">
              {name}
            </dt>
            <dd className="mt-1 font-display text-lg font-bold tracking-tight tabular-nums">
              {value}
            </dd>
          </div>
        ))}
        <div className="border-r border-b border-line px-3 py-3">
          <dt className="text-[11px] font-medium tracking-[0.08em] text-muted uppercase">RTO</dt>
          <dd className="mt-1.5">
            <Plate size="lg">{car.rtoDisplay} ••••</Plate>
          </dd>
        </div>
      </dl>
    </section>
  );
}

export function ConditionSection({ car }: { car: PublicCar }) {
  const rows = [
    ['Accident history', car.accidentHistory ? label(car.accidentHistory) : 'Not specified'],
    [
      'Major replacements',
      car.hasMajorReplacement == null ? 'Not specified' : car.hasMajorReplacement ? 'Yes' : 'None',
    ],
    ...(car.replacementDetails ? [['Replacement details', car.replacementDetails]] : []),
    ...(car.colour ? [['Colour', car.colour]] : []),
    ...(car.insuranceType ? [['Insurance', label(car.insuranceType)]] : []),
  ];
  return (
    <section
      aria-labelledby="condition-heading"
      className="rounded-card border border-line bg-surface p-4 md:p-5"
    >
      <h2 id="condition-heading" className="mb-2 text-lg font-bold">
        Condition
      </h2>
      <dl className="divide-y divide-line text-sm">
        {rows.map(([name, value]) => (
          <div key={name} className="flex justify-between gap-4 py-2.5">
            <dt className="text-muted">{name}</dt>
            <dd className="text-right font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
