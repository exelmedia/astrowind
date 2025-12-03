import type { StrapiArticle, StrapiResponse, StrapiSingleResponse } from '~/types/strapi';

const STRAPI_URL = import.meta.env.STRAPI_URL || 'https://strapi-u53948.vm.elestio.app';
const STRAPI_API_TOKEN = import.meta.env.STRAPI_API_TOKEN;

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
    'populate': '*', // Populate all relations that exist
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
    'populate': '*',
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
    'populate': '*',
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

/**
 * Convert Strapi Blocks format to HTML
 */
export function blocksToHtml(blocks: any): string {
  if (!blocks || !Array.isArray(blocks)) {
    return typeof blocks === 'string' ? blocks : '';
  }

  return blocks.map((block: any) => {
    switch (block.type) {
      case 'paragraph':
        const paragraphContent = block.children?.map((child: any) => formatTextNode(child)).join('') || '';
        return `<p>${paragraphContent}</p>`;

      case 'heading':
        const level = block.level || 1;
        const headingContent = block.children?.map((child: any) => formatTextNode(child)).join('') || '';
        return `<h${level}>${headingContent}</h${level}>`;

      case 'list':
        const listTag = block.format === 'ordered' ? 'ol' : 'ul';
        const listItems = block.children?.map((child: any) => blocksToHtml([child])).join('') || '';
        return `<${listTag}>${listItems}</${listTag}>`;

      case 'list-item':
        const itemContent = block.children?.map((child: any) => formatTextNode(child)).join('') || '';
        return `<li>${itemContent}</li>`;

      case 'quote':
        const quoteContent = block.children?.map((child: any) => formatTextNode(child)).join('') || '';
        return `<blockquote>${quoteContent}</blockquote>`;

      case 'code':
        const codeContent = block.children?.map((child: any) => child.text || '').join('') || '';
        return `<pre><code>${escapeHtml(codeContent)}</code></pre>`;

      case 'image':
        const imageUrl = getStrapiImageUrl(block.image?.url);
        const alt = block.image?.alternativeText || '';
        return imageUrl ? `<img src="${imageUrl}" alt="${alt}" />` : '';

      case 'link':
        const linkContent = block.children?.map((child: any) => formatTextNode(child)).join('') || '';
        return `<a href="${block.url}">${linkContent}</a>`;

      default:
        // For unknown types, try to render children
        if (block.children) {
          return block.children.map((child: any) => formatTextNode(child)).join('');
        }
        return '';
    }
  }).join('\n');
}

/**
 * Format a text node with inline formatting
 */
function formatTextNode(node: any): string {
  if (!node) return '';

  if (node.type === 'text' || node.text !== undefined) {
    let text = node.text || '';

    if (node.bold) text = `<strong>${text}</strong>`;
    if (node.italic) text = `<em>${text}</em>`;
    if (node.underline) text = `<u>${text}</u>`;
    if (node.strikethrough) text = `<s>${text}</s>`;
    if (node.code) text = `<code>${escapeHtml(text)}</code>`;

    return text;
  }

  // Handle nested nodes
  if (node.children) {
    return node.children.map((child: any) => formatTextNode(child)).join('');
  }

  return '';
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
