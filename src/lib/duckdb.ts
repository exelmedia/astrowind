import { Database } from 'duckdb-async';
import path from 'path';

export interface CityPage {
  Title: string;
  Slug: string;
  miasto: string;
  'miasto-odmienione': string;
  rank_math_title: string;
  rank_math_description: string;
}

let db: Database | null = null;

async function getDatabase() {
  if (!db) {
    db = await Database.create(':memory:');
  }
  return db;
}

/**
 * Get all city pages from CSV
 */
export async function getAllCityPages(): Promise<CityPage[]> {
  const database = await getDatabase();

  // Path to CSV file (relative to project root during build)
  const csvPath = path.join(process.cwd(), 'data', 'cities.csv');

  // Query CSV directly with DuckDB
  const result = await database.all(`
    SELECT
      Title,
      Slug,
      miasto,
      "miasto-odmienione",
      rank_math_title,
      rank_math_description
    FROM read_csv_auto('${csvPath}', delim=';', header=true)
  `);

  return result as CityPage[];
}

/**
 * Get a single city page by slug
 */
export async function getCityPageBySlug(slug: string): Promise<CityPage | null> {
  const database = await getDatabase();

  const csvPath = path.join(process.cwd(), 'data', 'cities.csv');

  const result = await database.all(`
    SELECT
      Title,
      Slug,
      miasto,
      "miasto-odmienione",
      rank_math_title,
      rank_math_description
    FROM read_csv_auto('${csvPath}', delim=';', header=true)
    WHERE Slug = ?
  `, [slug]);

  return result.length > 0 ? (result[0] as CityPage) : null;
}

/**
 * Close database connection (call this when done)
 */
export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}
