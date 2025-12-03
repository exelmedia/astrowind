// Strapi API Response Types

export interface StrapiImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  url: string;
}

export interface StrapiImage {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail?: StrapiImageFormat;
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface StrapiTag {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface StrapiAuthor {
  id: number;
  documentId: string;
  name: string;
  email: string | null;
  bio: string | null;
  avatar: StrapiImage | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Strapi Blocks format (Rich Text Editor v2)
export interface StrapiBlockNode {
  type: string;
  children?: Array<{
    type: string;
    text?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
    children?: StrapiBlockNode[];
  }>;
  level?: number;
  format?: string;
  image?: StrapiImage;
  url?: string;
}

export interface StrapiArticle {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content: string | StrapiBlockNode[]; // Can be string (old format) or blocks (new format)
  excerpt: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  image: StrapiImage | null;

  // Relations can have different naming conventions
  category?: StrapiCategory | null;
  Categories?: StrapiCategory[];

  tags?: StrapiTag[];
  Tags?: StrapiTag[] | null;

  author?: StrapiAuthor | null;
  Authors?: StrapiAuthor[];

  seo?: {
    metaTitle: string | null;
    metaDescription: string | null;
    keywords: string | null;
    metaImage: StrapiImage | null;
  } | null;
}

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

export interface StrapiError {
  error: {
    status: number;
    name: string;
    message: string;
    details: Record<string, unknown>;
  };
}
