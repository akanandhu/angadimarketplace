import { Calendar, Fuel, Gauge, MapPin, Settings2, Users } from 'lucide-react';
import type { PublicCar } from '@/lib/api/types';
import { formatKm, label, ordinalOwner } from '@/lib/format';

/** Year / KM / fuel / transmission / ownership / RTO. Registration is shown as RTO only. */
export function VehicleOverview({ car }: { car: PublicCar }) {
  const items = [
    { icon: Calendar, name: 'Year', value: String(car.manufacturingYear) },
    { icon: Gauge, name: 'KM driven', value: formatKm(car.kmDriven) },
    { icon: Fuel, name: 'Fuel', value: label(car.fuelType) },
    { icon: Settings2, name: 'Transmission', value: label(car.transmission) },
    { icon: Users, name: 'Ownership', value: ordinalOwner(car.numberOfOwners) },
    { icon: MapPin, name: 'RTO', value: `${car.rtoDisplay} ••••••` },
  ];
  return (
    <section
      aria-labelledby="overview-heading"
      className="rounded-card border border-line bg-surface p-4"
    >
      <h2 id="overview-heading" className="mb-3 font-semibold">
        Vehicle overview
      </h2>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
        {items.map(({ icon: Icon, name, value }) => (
          <div key={name} className="flex items-start gap-2.5">
            <Icon className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
            <div>
              <dt className="text-xs text-muted">{name}</dt>
              <dd className="text-sm font-semibold">{value}</dd>
            </div>
          </div>
        ))}
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
      className="rounded-card border border-line bg-surface p-4"
    >
      <h2 id="condition-heading" className="mb-3 font-semibold">
        Condition
      </h2>
      <dl className="divide-y divide-line text-sm">
        {rows.map(([name, value]) => (
          <div key={name} className="flex justify-between gap-4 py-2">
            <dt className="text-muted">{name}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
