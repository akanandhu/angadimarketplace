import { SeedBrand } from './catalogue-types';

export const MORE_BRANDS: SeedBrand[] = [
  {
    name: 'Volkswagen',
    sortOrder: 20,
    models: [
      { name: 'Polo', variants: ['Trendline', 'Comfortline', 'Highline', 'GT TSI'] },
      { name: 'Vento', variants: ['Trendline', 'Comfortline', 'Highline'] },
      { name: 'Virtus', variants: ['Comfortline', 'Highline', 'Topline', 'GT'] },
      { name: 'Taigun', variants: ['Comfortline', 'Highline', 'Topline', 'GT'] },
    ],
  },
  {
    name: 'Skoda',
    sortOrder: 21,
    models: [
      { name: 'Slavia', variants: ['Active', 'Ambition', 'Style'] },
      { name: 'Kushaq', variants: ['Active', 'Ambition', 'Style'] },
      { name: 'Rapid', variants: ['Rider', 'Ambition', 'Style'] },
      { name: 'Octavia', variants: ['Style', 'L&K'] },
    ],
  },
  {
    name: 'MG',
    sortOrder: 22,
    models: [
      { name: 'Hector', variants: ['Style', 'Shine', 'Smart', 'Sharp'] },
      { name: 'Astor', variants: ['Style', 'Shine', 'Select', 'Sharp'] },
      { name: 'ZS EV', variants: ['Executive', 'Excite', 'Exclusive'] },
      { name: 'Comet EV', variants: ['Executive', 'Excite', 'Exclusive'] },
    ],
  },
  {
    name: 'Nissan',
    sortOrder: 23,
    models: [
      { name: 'Magnite', variants: ['XE', 'XL', 'XV', 'XV Premium'] },
      { name: 'Micra', variants: ['XE', 'XL', 'XV'] },
      { name: 'Sunny', variants: ['XE', 'XL', 'XV'] },
    ],
  },
  {
    name: 'Ford',
    sortOrder: 24,
    models: [
      { name: 'EcoSport', variants: ['Ambiente', 'Trend', 'Titanium', 'Titanium Plus'] },
      { name: 'Figo', variants: ['Ambiente', 'Trend', 'Titanium'] },
      { name: 'Aspire', variants: ['Ambiente', 'Trend', 'Titanium'] },
      { name: 'Endeavour', variants: ['Titanium', 'Titanium Plus'] },
    ],
  },
  {
    name: 'Jeep',
    sortOrder: 25,
    models: [
      { name: 'Compass', variants: ['Sport', 'Longitude', 'Limited', 'Model S'] },
      { name: 'Meridian', variants: ['Limited', 'Limited Plus'] },
    ],
  },
  {
    name: 'Chevrolet',
    sortOrder: 26,
    models: [
      { name: 'Beat', variants: ['LS', 'LT', 'LT Option'] },
      { name: 'Cruze', variants: ['LT', 'LTZ'] },
    ],
  },
  {
    name: 'Mercedes-Benz',
    sortOrder: 30,
    models: [
      { name: 'C-Class', variants: ['C 200', 'C 220d', 'C 300d'] },
      { name: 'E-Class', variants: ['E 200', 'E 220d'] },
      { name: 'GLA', variants: ['200', '220d'] },
    ],
  },
  {
    name: 'BMW',
    sortOrder: 31,
    models: [
      { name: '3 Series', variants: ['320d', '330i', '330Li'] },
      { name: 'X1', variants: ['sDrive18i', 'sDrive18d'] },
      { name: '5 Series', variants: ['520d', '530i'] },
    ],
  },
  {
    name: 'Audi',
    sortOrder: 32,
    models: [
      { name: 'A4', variants: ['Premium', 'Premium Plus', 'Technology'] },
      { name: 'Q3', variants: ['Premium Plus', 'Technology'] },
    ],
  },
];
