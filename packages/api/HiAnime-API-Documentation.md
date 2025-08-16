# HiAnime API Documentation 📺

Comprehensive documentation for the HiAnime API endpoints used by Kanade anime streaming application.

## Base URL
```
https://hianime-api-qdks.onrender.com/api/v1
```

## API Endpoints Overview

The HiAnime API provides 8 main endpoints for accessing anime content:

1. [Home Page Data](#1-get-anime-home-page)
2. [Anime Lists](#2-get-anime-list-page)
3. [Anime Details](#3-get-anime-detailed-info)
4. [Search](#4-get-search-results)
5. [Search Suggestions](#5-get-search-suggestions)
6. [Episodes](#6-get-anime-episodes)
7. [Episode Servers](#7-get-anime-episode-servers)
8. [Streaming Links](#8-get-anime-episode-streaming-links)

## 1. GET Anime Home Page

Retrieve home page data including trending, popular, and featured anime.

**Endpoint:** `/api/v1/home`

**Method:** `GET`

**Parameters:** None

**Response Schema:**
```typescript
interface HomePageData {
  success: boolean;
  data: {
    spotlight: AnimeItem[];
    trending: AnimeItem[];
    topAiring: AnimeItem[];
    mostPopular: AnimeItem[];
    mostFavorite: AnimeItem[];
    latestCompleted: AnimeItem[];
    latestEpisode: AnimeItem[];
    newAdded: AnimeItem[];
    topUpcoming: AnimeItem[];
    top10: {
      today: AnimeItem[];
      week: AnimeItem[];
      month: AnimeItem[];
    };
    genres: string[];
  };
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "trending": [
      {
        "title": "One Piece",
        "alternativeTitle": "One Piece",
        "rank": 1,
        "poster": "https://cdn.noitatnemucod.net/thumbnail/300x400/100/bcd84731a3eda4f4a306250769675065.jpg",
        "id": "one-piece-100"
      }
    ]
  }
}
```

## 2. GET Anime List Page

Retrieve anime lists based on various categories and filters.

**Endpoint:** `/api/v1/animes/{query}/{category}?page={page}`

**Method:** `GET`

**Path Parameters:**
- `query`: List type (see valid queries below)
- `category`: Category filter (if applicable)

**Query Parameters:**
- `page`: Page number (optional, default: 1)

**Valid Queries:**
```javascript
[
  { "query": "top-airing", "hasCategory": false },
  { "query": "most-popular", "hasCategory": false },
  { "query": "most-favorite", "hasCategory": false },
  { "query": "completed", "hasCategory": false },
  { "query": "recently-added", "hasCategory": false },
  { "query": "recently-updated", "hasCategory": false },
  { "query": "top-upcoming", "hasCategory": false },
  { "query": "genre", "hasCategory": true, "category": "all genres" },
  { "query": "az-list", "hasCategory": true, "category": "0-9, all, a-z" },
  { "query": "subbed-anime", "hasCategory": false },
  { "query": "dubbed-anime", "hasCategory": false },
  { "query": "movie", "hasCategory": false },
  { "query": "tv", "hasCategory": false },
  { "query": "ova", "hasCategory": false },
  { "query": "ona", "hasCategory": false },
  { "query": "special", "hasCategory": false },
  { "query": "events", "hasCategory": false }
]
```

## 3. GET Anime Detailed Info

Retrieve comprehensive information about a specific anime.

**Endpoint:** `/api/v1/anime/{animeId}`

**Method:** `GET`

**Path Parameters:**
- `animeId`: Unique anime identifier

**Response Schema:**
```typescript
interface AnimeDetails {
  success: boolean;
  data: {
    title: string;
    alternativeTitle: string;
    japanese: string;
    id: string;
    poster: string;
    rating: string;
    type: string;
    episodes: {
      sub: number;
      dub: number;
      eps: number;
    };
    synopsis: string;
    synonyms: string;
    aired: {
      from: string;
      to: string;
    };
    premiered: string;
    duration: string;
    status: string;
    MAL_score: string;
    genres: string[];
    studios: string;
    producers: string[];
    moreSeasons: AnimeItem[];
    related: AnimeItem[];
    mostPopular: AnimeItem[];
    recommended: AnimeItem[];
  };
}
```

## 4. GET Search Results

Search for anime by keyword with pagination support.

**Endpoint:** `/api/v1/search?keyword={query}&page={page}`

**Method:** `GET`

**Query Parameters:**
- `keyword`: Search query string
- `page`: Page number (optional, default: 1)

**Response Schema:**
```typescript
interface SearchResults {
  success: boolean;
  data: {
    pageInfo: {
      totalPages: number;
      currentPage: number;
      hasNextPage: boolean;
    };
    response: AnimeItem[];
  };
}
```

## 5. GET Search Suggestions

Get search suggestions based on partial keyword input.

**Endpoint:** `/api/v1/search/suggestion?keyword={query}`

**Method:** `GET`

**Query Parameters:**
- `keyword`: Partial search query

**Response Schema:**
```typescript
interface SearchSuggestions {
  success: boolean;
  data: {
    title: string;
    alternativeTitle: string;
    poster: string;
    id: string;
    aired: string;
    type: string;
    duration: string;
  }[];
}
```

## 6. GET Anime Episodes

Retrieve list of episodes for a specific anime.

**Endpoint:** `/api/v1/episodes/{animeId}`

**Method:** `GET`

**Path Parameters:**
- `animeId`: Unique anime identifier

**Response Schema:**
```typescript
interface EpisodeList {
  success: boolean;
  data: {
    title: string;
    alternativeTitle: string;
    id: string;
    isFiller: boolean;
  }[];
}
```

## 7. GET Anime Episode Servers

Get available streaming servers for a specific episode.

**Endpoint:** `/api/v1/servers?id={id}`

**Method:** `GET`

**Query Parameters:**
- `id`: Episode identifier (format: `animeId::ep=episodeNumber`)

**Response Schema:**
```typescript
interface EpisodeServers {
  success: boolean;
  data: {
    episode: number;
    sub: {
      index: number;
      type: string;
      id: string;
      name: string;
    }[];
    dub: {
      index: number;
      type: string;
      id: string;
      name: string;
    }[];
  };
}
```

## 8. GET Anime Episode Streaming Links

Retrieve streaming links and metadata for a specific episode.

**Endpoint:** `/api/v1/stream?id={id}&server={server}&type={type}`

**Method:** `GET`

**Query Parameters:**
- `id`: Episode identifier
- `server`: Server name (e.g., "HD-2")
- `type`: Audio type ("dub" or "sub")

**Response Schema:**
```typescript
interface StreamingData {
  success: boolean;
  data: {
    streamingLink: {
      id: string;
      type: string;
      link: {
        file: string;
        type: string;
      };
      tracks: {
        file: string;
        kind: string;
      }[];
      intro: {
        start: number;
        end: number;
      };
      outro: {
        start: number;
        end: number;
      };
      server: string;
      iframe: string;
    };
    servers: string;
  };
}
```

## Common Data Types

### AnimeItem
```typescript
interface AnimeItem {
  title: string;
  alternativeTitle: string;
  id: string;
  poster: string;
  type?: string;
  episodes?: {
    sub: number;
    dub: number;
    eps: number;
  };
  duration?: string;
  rank?: number;
  quality?: string;
  aired?: string;
  synopsis?: string;
}
```

## Error Handling

All endpoints return a consistent error format:

```typescript
interface APIError {
  success: false;
  error: {
    message: string;
    code?: string;
  };
}
```

## Rate Limiting

- No official rate limiting is documented
- Recommended to implement client-side throttling
- Use reasonable delays between requests to avoid overwhelming the server

## Usage Notes

1. **Base URL**: Always use the full base URL for requests
2. **IDs**: Anime and episode IDs are strings, not numbers
3. **Pagination**: Most list endpoints support pagination via the `page` parameter
4. **Caching**: Consider implementing response caching to improve performance
5. **Error Handling**: Always check the `success` field in responses

## Example Usage in KanadeAPIClient

```typescript
// Search for trending anime
const homeData = await kanadeClient.makeRequest('/home');
const trending = homeData.data.trending;

// Search for specific anime
const searchResults = await kanadeClient.makeRequest('/search?keyword=naruto&page=1');

// Get anime details
const animeDetails = await kanadeClient.makeRequest('/anime/naruto-20');

// Get episodes
const episodes = await kanadeClient.makeRequest('/episodes/naruto-20');
```

## Authentication

The HiAnime API currently does not require authentication. All endpoints are publicly accessible.

## Disclaimer

This API documentation is based on the unofficial HiAnime API. The API is provided "as is" without warranty. Always respect the terms of service and use responsibly.
