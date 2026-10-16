import { execSync } from 'child_process';
import { Client } from 'pg';
import './env';

/** Creates the test database if needed, applies migrations and seeds reference data. */
export default async function globalSetup() {
  const url = new URL(process.env.DATABASE_URL!);
  const database = url.pathname.slice(1);
  const admin = new Client({
    connectionString: url.toString().replace(`/${database}`, '/postgres'),
  });
  await admin.connect();
  const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [database]);
  if (!exists.rowCount) await admin.query(`CREATE DATABASE "${database}"`);
  await admin.end();

  const options = { cwd: `${__dirname}/../..`, env: { ...process.env, SEED_ADMIN_PHONE: '' } };
  execSync('npx prisma migrate deploy', { ...options, stdio: 'ignore' });
  execSync('npx tsx prisma/seed/index.ts', { ...options, stdio: 'ignore' });
}
