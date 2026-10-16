export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Marker type so the response interceptor emits `{ data, meta }`. */
export class Paginated<T> {
  constructor(
    public readonly items: T[],
    public readonly meta: PageMeta,
  ) {}

  static of<T>(items: T[], total: number, page: number, limit: number): Paginated<T> {
    return new Paginated(items, { page, limit, total, totalPages: Math.ceil(total / limit) });
  }

  map<U>(fn: (item: T) => U): Paginated<U> {
    return new Paginated(this.items.map(fn), this.meta);
  }
}
