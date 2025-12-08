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
    'populate': '*',
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
 * Convert Strapi Blocks format to HTML with optional CTA injection
 */
export function blocksToHtml(blocks: any, injectCTA: boolean = true): string {
  if (!blocks || !Array.isArray(blocks)) {
    return typeof blocks === 'string' ? blocks : '';
  }

  const htmlBlocks = blocks.map((block: any) => {
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
        const listItems = block.children?.map((child: any) => blocksToHtml([child], false)).join('') || '';
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
  });

  // Inject CTA in the middle of the content (after ~40% of paragraphs)
  if (injectCTA && htmlBlocks.length > 6) {
    const ctaPosition = Math.floor(htmlBlocks.length * 0.4);
    const ctaHtml = `
      <div class="not-prose my-8 p-6 bg-gradient-to-r from-[#2b9e40]/10 to-[#0b74b5]/10 dark:from-[#2b9e40]/20 dark:to-[#0b74b5]/20 rounded-xl border-2 border-[#2b9e40]/30 dark:border-[#2b9e40]/40">
        <div class="text-center">
          <p class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Potrzebujesz pomocy w automatyzacji procesów?
          </p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a href="tel:+48510442282" class="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-[#2b9e40] hover:bg-[#238a36] rounded-full transition-all duration-200 hover:shadow-lg hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              510 442 282
            </a>
            <a href="mailto:pomoc@uczciweit.pl" class="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border-2 border-[#2b9e40] rounded-full transition-all duration-200 hover:shadow-lg hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
              pomoc@uczciweit.pl
            </a>
          </div>
        </div>
      </div>
    `;
    htmlBlocks.splice(ctaPosition, 0, ctaHtml);
  }

  return htmlBlocks.join('\n');
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
