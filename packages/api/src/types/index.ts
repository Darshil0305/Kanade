import { z } from 'zod';

/**
 * Common API response structure for HiAnime API
 */
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
});

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

/**
 * Anime information structure
 */
export const AnimeSchema = z.object({
  id: z.string(),
  title: z.string(),
  alternativeTitles: z.array(z.string()).optional(),
  synopsis: z.string().optional(),
  poster: z.string().optional(),
  banner: z.string().optional(),
  genres: z.array(z.string()).default([]),
  studios: z.array(z.string()).default([]),
  status: z.enum(['ongoing', 'completed', 'upcoming', 'unknown']).default('unknown'),
  type: z.enum(['tv', 'movie', 'ova', 'ona', 'special', 'music', 'unknown']).default('unknown'),
  episodes: z.number().optional(),
  duration: z.string().optional(),
  rating: z.number().min(0).max(10).optional(),
  year: z.number().optional(),
  season: z.enum(['spring', 'summer', 'fall', 'winter']).optional(),
  aired: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }).optional(),
  mal_id: z.number().optional(),
  anilist_id: z.number().optional(),
});

export type Anime = z.infer<typeof AnimeSchema>;

/**
 * Episode information structure
 */
export const EpisodeSchema = z.object({
  id: z.string(),
  number: z.number(),
  title: z.string().optional(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  duration: z.string().optional(),
  aired: z.string().optional(),
  filler: z.boolean().default(false),
  recap: z.boolean().default(false),
});

export type Episode = z.infer<typeof EpisodeSchema>;

/**
 * Streaming server information
 */
export const StreamingServerSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  quality: z.string().optional(),
  type: z.enum(['sub', 'dub', 'raw']).default('sub'),
  isWorking: z.boolean().default(true),
});

export type StreamingServer = z.infer<typeof StreamingServerSchema>;

/**
 * Episode streaming sources
 */
export const EpisodeSourcesSchema = z.object({
  episodeId: z.string(),
  sources: z.array(StreamingServerSchema),
  download: z.array(z.object({
    quality: z.string(),
    url: z.string().url(),
  })).optional(),
  subtitles: z.array(z.object({
    lang: z.string(),
    url: z.string().url(),
  })).optional(),
});

export type EpisodeSources = z.infer<typeof EpisodeSourcesSchema>;

/**
 * Search filters for anime
 */
export const SearchFiltersSchema = z.object({
  genre: z.array(z.string()).optional(),
  year: z.number().optional(),
  season: z.enum(['spring', 'summer', 'fall', 'winter']).optional(),
  status: z.enum(['ongoing', 'completed', 'upcoming']).optional(),
  type: z.enum(['tv', 'movie', 'ova', 'ona', 'special', 'music']).optional(),
  sort: z.enum(['popularity', 'rating', 'title', 'recently-added', 'recently-updated']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

export type SearchFilters = z.infer<typeof SearchFiltersSchema>;

/**
 * Search result structure
 */
export const SearchResultSchema = z.object({
  results: z.array(AnimeSchema),
  totalResults: z.number(),
  currentPage: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

/**
 * API Error structure
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Request configuration options
 */
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

/**
 * Client configuration options
 */
export interface ClientConfig extends RequestConfig {
  baseUrl?: string;
  userAgent?: string;
  enableLogging?: boolean;
}

/**
 * Available genres (based on HiAnime API)
 */
export const ANIME_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports',
  'Supernatural', 'Thriller', 'Historical', 'Psychological',
  'School', 'Military', 'Demons', 'Vampire', 'Magic',
  'Martial Arts', 'Music', 'Parody', 'Police', 'Space',
  'Super Power', 'Mecha', 'Ecchi', 'Harem', 'Josei',
  'Seinen', 'Shoujo', 'Shounen', 'Kids', 'Game'
] as const;

export type AnimeGenre = typeof ANIME_GENRES[number];

/**
 * API endpoints constants
 */
export const API_ENDPOINTS = {
  SEARCH: '/search',
  ANIME_INFO: '/info',
  EPISODES: '/episodes',
  EPISODE_SOURCES: '/sources',
  TRENDING: '/trending',
  POPULAR: '/popular',
  RECENT: '/recent',
  RANDOM: '/random',
  GENRES: '/genres',
} as const;

/**
 * Export all schemas for runtime validation
 */
export const Schemas = {
  ApiResponse: ApiResponseSchema,
  Anime: AnimeSchema,
  Episode: EpisodeSchema,
  StreamingServer: StreamingServerSchema,
  EpisodeSources: EpisodeSourcesSchema,
  SearchFilters: SearchFiltersSchema,
  SearchResult: SearchResultSchema,
} as const;
