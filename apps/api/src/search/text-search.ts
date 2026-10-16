import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const MAX_TERMS = 6;
const MAX_MATCHES = 2000;
const SIMILARITY = 0.4;
/** Very short terms ("sx", "vx") only match as substrings to avoid noisy fuzzy hits. */
const MIN_FUZZY_LENGTH = 4;

const escapeLike = (term: string) => term.replace(/[\\%_]/g, (char) => `\\${char}`);

/**
 * Typo-tolerant matching with pg_trgm: every term must appear in the listing's
 * search text, either as a substring or as a close word match ("creata" -> "creta").
 */
export async function matchListingIds(prisma: PrismaService, q: string): Promise<string[]> {
  const terms = q
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.replace(/[^\p{L}\p{N}().+-]/gu, ''))
    .filter(Boolean)
    .slice(0, MAX_TERMS);
  if (!terms.length) return [];

  const conditions = terms.map((term) => {
    const like = Prisma.sql`search_text ILIKE ${`%${escapeLike(term)}%`}`;
    if (term.length < MIN_FUZZY_LENGTH) return like;
    return Prisma.sql`(${like} OR word_similarity(${term}, search_text) >= ${SIMILARITY})`;
  });
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM listings
    WHERE status = 'ACTIVE' AND ${Prisma.join(conditions, ' AND ')}
    LIMIT ${MAX_MATCHES}`;
  return rows.map((row) => row.id);
}
