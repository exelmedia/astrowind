# Integracja ze Strapi CMS

Ten projekt wykorzystuje Strapi CMS jako źródło artykułów blogowych zamiast lokalnych plików Markdown.

## Konfiguracja

### 1. Zmienne środowiskowe

Utwórz plik `.env` w głównym katalogu projektu:

```env
STRAPI_URL=https://strapi-u53948.vm.elestio.app
STRAPI_API_TOKEN=twoj_token_api
```

**Uwaga:** Token API jest opcjonalny, ale zalecany dla zabezpieczenia dostępu do API.

### 2. Struktura w Strapi

Projekt wymaga następujących kolekcji w Strapi:

#### Collection: Articles
- `title` (String) - Tytuł artykułu
- `slug` (String) - SEO-friendly URL
- `content` (Rich Text / Markdown) - Treść artykułu
- `excerpt` (Text) - Krótki opis artykułu
- `publishedAt` (DateTime) - Data publikacji
- `image` (Media) - Zdjęcie główne artykułu
- `category` (Relation) - Kategoria artykułu
- `tags` (Relation) - Tagi artykułu
- `author` (Relation) - Autor artykułu
- `seo` (Component) - Metadane SEO

#### Collection: Categories
- `name` (String) - Nazwa kategorii
- `slug` (String) - SEO-friendly URL
- `description` (Text) - Opis kategorii

#### Collection: Tags
- `name` (String) - Nazwa taga
- `slug` (String) - SEO-friendly URL

#### Collection: Authors
- `name` (String) - Imię i nazwisko autora
- `email` (Email) - Adres email
- `bio` (Text) - Biografia
- `avatar` (Media) - Zdjęcie profilowe

#### Component: SEO
- `metaTitle` (String) - Tytuł SEO
- `metaDescription` (Text) - Opis SEO
- `keywords` (String) - Słowa kluczowe
- `metaImage` (Media) - Obraz Open Graph

### 3. Uprawnienia API w Strapi

Upewnij się, że następujące endpointy są dostępne publicznie lub z tokenem API:

1. Przejdź do Settings → Users & Permissions Plugin → Roles
2. Dla roli "Public" (lub "Authenticated" jeśli używasz tokena):
   - Articles: `find`, `findOne`
   - Categories: `find`, `findOne`
   - Tags: `find`, `findOne`
   - Authors: `find`, `findOne`

## Jak to działa

### Pliki kluczowe

1. **src/types/strapi.ts** - Typy TypeScript dla Strapi API
2. **src/lib/strapi.ts** - Funkcje do komunikacji z Strapi API
3. **src/utils/blog-strapi.ts** - Adapter konwertujący dane ze Strapi na format używany w projekcie

### Proces pobierania danych

1. **Build time**: Podczas budowania projektu (`npm run build`), Astro wywołuje `getAllArticles()` ze Strapi
2. **Konwersja**: Artykuły ze Strapi są konwertowane na format `Post` używany w projekcie
3. **Static Generation**: Dla każdego artykułu generowana jest statyczna strona HTML
4. **Cachowanie**: Dane są cachowane podczas buildu - nie ma zapytań do Strapi w runtime

### Funkcje API

#### Pobieranie artykułów

```typescript
import { getAllArticles, getArticleBySlug } from '~/lib/strapi';

// Pobierz wszystkie artykuły
const articles = await getAllArticles();

// Pobierz artykuł po slug
const article = await getArticleBySlug('moj-artykul');
```

#### Obrazy

```typescript
import { getStrapiImageUrl, getOptimizedImageUrl } from '~/lib/strapi';

// Pełny URL do obrazu
const imageUrl = getStrapiImageUrl(article.image.url);

// URL zoptymalizowanego obrazu (preferuje medium/large format)
const optimizedUrl = getOptimizedImageUrl(article.image);
```

## Struktura contentu w Strapi

### Rich Text / HTML Content

Strapi może zwracać content w różnych formatach:
- **Markdown**: Jeśli używasz Markdown w Strapi, musisz dodać parser (np. `marked`)
- **HTML**: Jeśli używasz HTML, jest renderowany bezpośrednio przez `set:html` w Astro
- **Rich Text (Blocks)**: Strapi v4+ używa formatu blocks - wymaga custom renderera

Obecnie projekt obsługuje HTML content ze Strapi.

## Development

### Lokalny development

Podczas developmentu (`npm run dev`), artykuły są pobierane przy każdym buildzapytaniu do strony bloga.

### Preview changes

Jeśli zaktualizujesz artykuły w Strapi:

```bash
npm run build  # Przebuduj projekt z nowymi danymi ze Strapi
npm run preview  # Zobacz zmiany lokalnie
```

### Deploy

Po wdrożeniu na produkcję, aby zaktualizować artykuły:

1. Zaktualizuj content w Strapi
2. Uruchom ponownie build procesu CI/CD (np. Vercel, Netlify automatycznie)
3. Lub ustaw webhook w Strapi, który automatycznie uruchomi rebuild

## Webhook dla automatycznych aktualizacji

### Konfiguracja webhooków w Strapi

1. W Strapi: Settings → Webhooks → Create new webhook
2. Ustaw URL do swojego providera CI/CD:
   - **Vercel**: `https://api.vercel.com/v1/integrations/deploy/[ID]`
   - **Netlify**: `https://api.netlify.com/build_hooks/[ID]`
3. Wybierz eventy: `entry.create`, `entry.update`, `entry.delete`, `entry.publish`, `entry.unpublish`
4. Zastosuj do kolekcji: Articles, Categories, Tags

Teraz każda zmiana w Strapi automatycznie uruchomi rebuild strony!

## Migracja z lokalnych plików Markdown

Jeśli masz istniejące artykuły w `src/data/post/*.md`:

1. **Ręcznie**: Skopiuj content każdego artykułu do Strapi przez panel admin
2. **Programowo**: Napisz skrypt migracyjny używając Strapi API:

```typescript
// migrate.ts
import fs from 'fs';
import matter from 'gray-matter';

const files = fs.readdirSync('src/data/post');

for (const file of files) {
  const content = fs.readFileSync(`src/data/post/${file}`, 'utf-8');
  const { data, content: markdown } = matter(content);

  // POST do Strapi API
  await fetch('https://strapi-u53948.vm.elestio.app/api/articles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`
    },
    body: JSON.stringify({
      data: {
        title: data.title,
        slug: data.slug || file.replace('.md', ''),
        content: markdown,
        excerpt: data.excerpt,
        publishedAt: data.publishDate,
        // ... inne pola
      }
    })
  });
}
```

## Troubleshooting

### Problem: "Strapi API error: 403 Forbidden"
**Rozwiązanie**: Sprawdź uprawnienia API w Strapi (Settings → Roles)

### Problem: "No articles found"
**Rozwiązanie**:
- Sprawdź czy masz opublikowane artykuły w Strapi
- Zweryfikuj URL Strapi w `.env`
- Sprawdź logi buildu pod kątem błędów API

### Problem: Obrazy się nie wyświetlają
**Rozwiązanie**:
- Sprawdź czy obrazy są przesłane do Strapi
- Zweryfikuj konfigurację upload providera w Strapi
- Sprawdź CORS settings w Strapi dla domeny produkcyjnej

### Problem: Content nie renderuje się poprawnie
**Rozwiązanie**:
- Sprawdź format contentu w Strapi (HTML vs Markdown vs Blocks)
- Jeśli używasz Markdown, dodaj parser
- Jeśli używasz Blocks, dodaj custom renderer

## API Strapi - Dokumentacja

Pełna dokumentacja API Strapi: https://docs.strapi.io/cms/api/rest

### Przykładowe zapytania

```bash
# Pobierz wszystkie artykuły z relacjami
curl "https://strapi-u53948.vm.elestio.app/api/articles?populate=*"

# Pobierz artykuł po slug
curl "https://strapi-u53948.vm.elestio.app/api/articles?filters[slug][$eq]=moj-artykul&populate=*"

# Filtrowanie po kategorii
curl "https://strapi-u53948.vm.elestio.app/api/articles?filters[category][slug][$eq]=technologia&populate=*"

# Sortowanie i paginacja
curl "https://strapi-u53948.vm.elestio.app/api/articles?sort=publishedAt:desc&pagination[page]=1&pagination[pageSize]=10"
```

## Wsparcie

W razie problemów:
1. Sprawdź dokumentację Strapi: https://docs.strapi.io
2. Sprawdź logi buildu Astro
3. Sprawdź console.log w `src/lib/strapi.ts`
