import type { StrapiArticle, StrapiResponse, StrapiSingleResponse } from '~/types/strapi';

const STRAPI_URL = import.meta.env.STRAPI_URL || 'https://strapi-u53948.vm.elestio.app';
const STRAPI_API_TOKEN = import.meta.env.STRAPI_API_TOKEN;

interface FetchOptions {
  endpoint: string;
  query?: Record<string, string | number | boolean | string[]>;
  wrappedByKey?: string;
  wrappedByList?: boolean;
}

/**
 * Fetch data from Strapi API
 */
async function fetchAPI<T>(
  endpoint: string,
  query?: Record<string, string | number | boolean | string[]>,
  options: RequestInit = {}
): Promise<T> {
  const url = new URL(`/api${endpoint}`, STRAPI_URL);

  // Add query parameters
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, String(v)));
      } else {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add authorization header if token is available
  if (STRAPI_API_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  }

  try {
    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('Error fetching from Strapi:', error);
    throw error;
  }
}

/**
 * Get all articles with pagination
 */
export async function getArticles(
  page = 1,
  pageSize = 10,
  filters?: Record<string, unknown>
): Promise<StrapiResponse<StrapiArticle[]>> {
  const query: Record<string, string | number | boolean | string[]> = {
    'pagination[page]': page,
    'pagination[pageSize]': pageSize,
    'populate[image]': '*',
    'populate[category]': '*',
    'populate[tags]': '*',
    'populate[author]': '*',
    'populate[author][populate][avatar]': '*',
    'populate[seo]': '*',
    'populate[seo][populate][metaImage]': '*',
    'sort[0]': 'publishedAt:desc',
  };

  // Add filters if provided
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query[`filters[${key}]`] = String(value);
    });
  }

  return fetchAPI<StrapiResponse<StrapiArticle[]>>('/articles', query);
}

/**
 * Get a single article by slug
 */
export async function getArticleBySlug(slug: string): Promise<StrapiArticle | null> {
  const query: Record<string, string | number | boolean | string[]> = {
    'filters[slug][$eq]': slug,
    'populate[image]': '*',
    'populate[category]': '*',
    'populate[tags]': '*',
    'populate[author]': '*',
    'populate[author][populate][avatar]': '*',
    'populate[seo]': '*',
    'populate[seo][populate][metaImage]': '*',
  };

  const response = await fetchAPI<StrapiResponse<StrapiArticle[]>>('/articles', query);

  if (response.data && response.data.length > 0) {
    return response.data[0];
  }

  return null;
}

/**
 * Get a single article by document ID
 */
export async function getArticleById(documentId: string): Promise<StrapiArticle | null> {
  const query: Record<string, string | number | boolean | string[]> = {
    'populate[image]': '*',
    'populate[category]': '*',
    'populate[tags]': '*',
    'populate[author]': '*',
    'populate[author][populate][avatar]': '*',
    'populate[seo]': '*',
    'populate[seo][populate][metaImage]': '*',
  };

  try {
    const response = await fetchAPI<StrapiSingleResponse<StrapiArticle>>(`/articles/${documentId}`, query);
    return response.data;
  } catch (error) {
    console.error(`Article with ID ${documentId} not found:`, error);
    return null;
  }
}

/**
 * Get articles by category
 */
export async function getArticlesByCategory(
  categorySlug: string,
  page = 1,
  pageSize = 10
): Promise<StrapiResponse<StrapiArticle[]>> {
  return getArticles(page, pageSize, {
    'category[slug][$eq]': categorySlug,
  });
}

/**
 * Get articles by tag
 */
export async function getArticlesByTag(
  tagSlug: string,
  page = 1,
  pageSize = 10
): Promise<StrapiResponse<StrapiArticle[]>> {
  return getArticles(page, pageSize, {
    'tags[slug][$eq]': tagSlug,
  });
}

/**
 * Get all published articles (for static generation)
 */
export async function getAllArticles(): Promise<StrapiArticle[]> {
  const allArticles: StrapiArticle[] = [];
  let page = 1;
  let hasMore = true;
  const pageSize = 100;

  while (hasMore) {
    const response = await getArticles(page, pageSize);

    if (response.data && response.data.length > 0) {
      allArticles.push(...response.data);

      if (response.meta.pagination) {
        hasMore = page < response.meta.pagination.pageCount;
        page++;
      } else {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  return allArticles;
}

/**
 * Get image URL from Strapi
 */
export function getStrapiImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // If URL is already absolute, return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Otherwise, prepend Strapi URL
  return `${STRAPI_URL}${url}`;
}

/**
 * Get optimized image URL (prefer medium size if available)
 */
export function getOptimizedImageUrl(image: { formats?: { medium?: { url: string }; large?: { url: string } }; url: string } | null): string | null {
  if (!image) return null;

  const mediumUrl = image.formats?.medium?.url;
  const largeUrl = image.formats?.large?.url;

  return getStrapiImageUrl(mediumUrl || largeUrl || image.url);
}
