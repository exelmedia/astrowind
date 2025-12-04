import citiesData from '../../data/cities.json';

export interface CityPage {
  Title: string;
  Slug: string;
  miasto: string;
  'miasto-odmienione': string;
  rank_math_title: string;
  rank_math_description: string;
}

const cities: CityPage[] = citiesData as CityPage[];

/**
 * Get all city pages from JSON
 */
export function getAllCityPages(): CityPage[] {
  return cities;
}

/**
 * Get a single city page by slug
 */
export function getCityPageBySlug(slug: string): CityPage | null {
  const city = cities.find((city) => city.Slug === slug);
  return city || null;
}
