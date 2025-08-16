/**
 * @kanade/api - HiAnime API Client Package
 * 
 * This package provides a comprehensive TypeScript client for the HiAnime API,
 * enabling easy access to anime data, search functionality, and streaming sources.
 */

// Export the main API client class
export { HiAnimeClient, hianimeClient as default } from './client';

// Export all types from the types directory for convenience
export * from './types';

// Re-export commonly used types for easier imports
export type {
  Anime,
  Episode,
  EpisodeSources,
  SearchResult,
  SearchFilters,
  ApiResponse,
  ApiError,
  ClientConfig,
  RequestConfig
} from './types';

/**
 * Package version and metadata
 */
export const VERSION = '1.0.0';
export const PACKAGE_NAME = '@kanade/api';

/**
 * Default export is a pre-configured instance of HiAnimeClient
 * 
 * @example
 * ```typescript
 * import api from '@kanade/api';
 * 
 * // Search for anime
 * const results = await api.search('naruto');
 * 
 * // Get anime details
 * const anime = await api.getAnimeInfo('anime-id');
 * 
 * // Get episode list
 * const episodes = await api.getEpisodes('anime-id');
 * 
 * // Get streaming sources
 * const sources = await api.getEpisodeSources('episode-id');
 * ```
 */

/**
 * Named exports for advanced usage
 * 
 * @example
 * ```typescript
 * import { HiAnimeClient, SearchFilters } from '@kanade/api';
 * 
 * // Create custom client instance
 * const customClient = new HiAnimeClient({
 *   baseUrl: 'https://custom-hianime-api.com',
 *   timeout: 10000,
 *   enableLogging: true
 * });
 * 
 * // Use with custom filters
 * const filters: SearchFilters = {
 *   genre: ['Action', 'Adventure'],
 *   year: 2024,
 *   status: 'ongoing',
 *   sort: 'popularity'
 * };
 * 
 * const results = await customClient.search('anime query', filters);
 * ```
 */
