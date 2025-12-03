# Strapi CMS - Quick Start

## Szybka konfiguracja

### 1. Ustaw zmienne środowiskowe

Skopiuj `.env.example` do `.env`:

```bash
cp .env.example .env
```

Edytuj `.env` i ustaw swoje wartości:

```env
STRAPI_URL=https://strapi-u53948.vm.elestio.app
STRAPI_API_TOKEN=twoj_token_api_tutaj
```

### 2. Uzyskaj API Token ze Strapi

1. Zaloguj się do panelu Strapi: https://strapi-u53948.vm.elestio.app/admin
2. Przejdź do: **Settings** → **API Tokens** → **Create new API Token**
3. Wypełnij formularz:
   - **Name**: `Astro Website`
   - **Token type**: `Read-only` (zalecane) lub `Full access`
   - **Token duration**: `Unlimited`
4. Skopiuj wygenerowany token i wklej do `.env`

### 3. Konfiguracja uprawnień API

Jeśli nie chcesz używać tokena (publiczny dostęp):

1. W Strapi: **Settings** → **Users & Permissions** → **Roles** → **Public**
2. Zaznacz uprawnienia dla:
   - **Articles**: `find`, `findOne`
   - **Categories**: `find`, `findOne`
   - **Tags**: `find`, `findOne`
   - **Authors**: `find`, `findOne`
3. Kliknij **Save**

### 4. Struktura kolekcji w Strapi

Upewnij się, że masz następujące kolekcje:

#### Articles (Content-Type)
```
title: String (required)
slug: String (required, unique)
content: RichText or Text (required)
excerpt: Text
publishedAt: DateTime
image: Media (single)
category: Relation (Many-to-One → Categories)
tags: Relation (Many-to-Many → Tags)
author: Relation (Many-to-One → Authors)
seo: Component (Repeatable: false)
```

#### Categories (Content-Type)
```
name: String (required)
slug: String (required, unique)
description: Text
```

#### Tags (Content-Type)
```
name: String (required)
slug: String (required, unique)
```

#### Authors (Content-Type)
```
name: String (required)
email: Email
bio: Text
avatar: Media (single)
```

#### SEO (Component)
```
metaTitle: String
metaDescription: Text
keywords: String
metaImage: Media (single)
```

### 5. Dodaj przykładowy artykuł

1. W Strapi przejdź do: **Content Manager** → **Articles** → **Create new entry**
2. Wypełnij formularz:
   - **Title**: Mój pierwszy artykuł
   - **Slug**: moj-pierwszy-artykul
   - **Content**: Treść artykułu w HTML lub Markdown
   - **Excerpt**: Krótki opis artykułu
   - **Image**: Prześlij zdjęcie
3. Kliknij **Save** → **Publish**

### 6. Testowanie lokalnie

```bash
# Zainstaluj zależności (jeśli jeszcze nie zrobiłeś)
npm install

# Uruchom development server
npm run dev
```

Otwórz http://localhost:4321/blog - powinieneś zobaczyć swoje artykuły ze Strapi!

### 7. Build i deployment

```bash
# Zbuduj projekt ze Strapi
npm run build

# Podejrzyj lokalnie
npm run preview
```

## Rozwiązywanie problemów

### Brak artykułów na stronie

**Sprawdź:**
- Czy artykuły są opublikowane (Published) w Strapi?
- Czy STRAPI_URL w `.env` jest poprawny?
- Czy uprawnienia API są ustawione?
- Logi w konsoli: `npm run dev` (sprawdź błędy API)

### Błąd 403 Forbidden

**Rozwiązanie:**
- Dodaj API Token do `.env`
- LUB ustaw uprawnienia Public w Strapi

### Obrazy się nie ładują

**Sprawdź:**
- Czy obrazy są przesłane do Strapi?
- Czy URL obrazu jest poprawny (sprawdź w przeglądarce)
- CORS settings w Strapi: Settings → Global settings → Security

## Co dalej?

Przeczytaj pełną dokumentację: [STRAPI_INTEGRATION.md](./STRAPI_INTEGRATION.md)

Dowiesz się o:
- Webhookach dla automatycznych aktualizacji
- Migracji z lokalnych plików Markdown
- Zaawansowanej konfiguracji
- Best practices
