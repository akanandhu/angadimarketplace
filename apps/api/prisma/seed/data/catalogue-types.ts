export interface SeedModel {
  name: string;
  variants: string[];
}

export interface SeedBrand {
  name: string;
  sortOrder: number;
  models: SeedModel[];
}
