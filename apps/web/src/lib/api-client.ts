/**
 * HiAnime API Client for Kanade
 * Base URL: https://hianime-api-qdks.onrender.com/api/v1
 */
const HIANIME_API_BASE = 'https://hianime-api-qdks.onrender.com/api/v1'

/**
 * Custom error class for API errors
 */
class HiAnimeAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public endpoint?: string
  ) {
    super(message)
    this.name = 'HiAnimeAPIError'
  }
}

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${HIANIME_API_BASE}${endpoint}`
  
  // Log the exact URL being requested
  console.log(`[API] Making request to: ${url}`)
  console.log(`[API] Endpoint: ${endpoint}`)
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Kanade/1.0.0',
        ...options?.headers,
      },
      ...options,
    })
    
    console.log(`[API] Response status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error(`[API] Request failed:`, {
        url,
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      throw new HiAnimeAPIError(
        `API request failed: ${response.status} ${response.statusText} - ${errorText}`,
        response.status,
        endpoint
      )
    }
    
    const data = await response.json()
    console.log(`[API] Response data structure:`, {
      success: data.success,
      hasData: !!data.data,
      dataKeys: data.data ? Object.keys(data.data) : [],
      messageType: typeof data.message
    })
    
    // Check if the API returned an error in the response body
    if (data.error || data.status === false) {
      console.error(`[API] API returned error:`, data)
      throw new HiAnimeAPIError(
        data.message || data.error || 'API returned error',
        response.status,
        endpoint
      )
    }
    
    return data
  } catch (error) {
    if (error instanceof HiAnimeAPIError) {
      throw error
    }
    
    // Network or other errors
    console.error(`[API] Network/fetch error:`, {
      url,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    throw new HiAnimeAPIError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      endpoint
    )
  }
}

/**
 * Type definitions for API responses
 */
export interface Anime {
  id: string
  title: string
  image: string
  poster: string // Add poster field for compatibility
  type: string
  rating?: string
  releaseDate?: string
  status?: string
  genres?: string[]
  description?: string
  totalEpisodes?: number
  duration?: string
  sub?: number
  dub?: number
  eps?: number
}

export interface Episode {
  id: string
  number: number
  title?: string
  isFiller?: boolean
}

export interface StreamingServer {
  name: string
  url: string
}

export interface SearchResult {
  animes: Anime[]
  totalResults: number
  hasNextPage: boolean
  currentPage: number
}

export interface HomeData {
  spotlightAnimes?: Anime[]
  trendingAnimes?: Anime[]
  latestEpisodeAnimes?: Anime[]
  topUpcomingAnimes?: Anime[]
  topAiringAnimes?: Anime[]
  mostPopularAnimes?: Anime[]
  mostFavoriteAnimes?: Anime[]
  latestCompletedAnimes?: Anime[]
}

/**
 * HiAnime API client class
 */
class HiAnimeAPI {
  /**
   * Get home page data with various anime collections
   */
  async getHomeData(): Promise<HomeData> {
    return apiFetch<HomeData>('/home')
  }

  /**
   * Search for anime by query
   */
  async searchAnime(
    query: string,
    page: number = 1,
    type?: 'all' | 'movie' | 'tv' | 'ova' | 'ona' | 'special',
    status?: 'all' | 'finished-airing' | 'currently-airing' | 'not-yet-aired',
    genre?: string
  ): Promise<SearchResult> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
    })
    if (type && type !== 'all') params.append('type', type)
    if (status && status !== 'all') params.append('status', status)
    if (genre) params.append('genre', genre)
    
    const result = await apiFetch<SearchResult>(`/anime/search?${params.toString()}`)
    
    // Transform the response to ensure compatibility
    if (result.animes) {
      result.animes = result.animes.map(anime => ({
        ...anime,
        poster: anime.poster || anime.image // Ensure poster field exists
      }))
    }
    return result
  }

  /**
   * Get detailed information about an anime
   * Updated to use correct endpoint format
   */
  async getAnimeInfo(animeId: string): Promise<{
    anime: Anime & {
      episodes: Episode[]
      recommendations?: Anime[]
      relations?: Anime[]
    }
  }> {
    console.log(`[API] Getting anime info for ID: ${animeId}`)
    // Try the correct endpoint format: /anime/info?id=anime-id
    const result = await apiFetch(`/anime/info?id=${encodeURIComponent(animeId)}`)
    console.log(`[API] Anime info result:`, result)
    return result
  }

  /**
   * Get streaming servers for an episode
   */
  async getEpisodeServers(episodeId: string): Promise<{
    servers: StreamingServer[]
  }> {
    return apiFetch(`/anime/episode-srcs?id=${encodeURIComponent(episodeId)}`)
  }

  /**
   * Get streaming sources for an episode
   */
  async getEpisodeSources(episodeId: string, server?: string): Promise<{
    sources: Array<{
      url: string
      quality: string
      isM3U8: boolean
    }>
    subtitles?: Array<{
      url: string
      lang: string
    }>
  }> {
    const params = new URLSearchParams({ id: episodeId })
    if (server) params.append('server', server)
    
    return apiFetch(`/anime/episode-srcs?${params.toString()}`)
  }

  /**
   * Get anime by genre
   */
  async getAnimeByGenre(
    genreId: string,
    page: number = 1
  ): Promise<SearchResult> {
    return apiFetch<SearchResult>(`/anime/genre/${encodeURIComponent(genreId)}?page=${page}`)
  }

  /**
   * Get trending anime
   */
  async getTrendingAnime(page: number = 1): Promise<SearchResult> {
    return apiFetch<SearchResult>(`/anime/trending?page=${page}`)
  }

  /**
   * Get recently added anime
   */
  async getRecentlyAdded(page: number = 1): Promise<SearchResult> {
    return apiFetch<SearchResult>(`/anime/recently-added?page=${page}`)
  }

  /**
   * Get recently updated anime episodes
   */
  async getRecentEpisodes(page: number = 1): Promise<{
    episodes: Array<{
      id: string
      title: string
      episodeNumber: number
      animeId: string
      animeTitle: string
      image: string
    }>
    hasNextPage: boolean
    totalPages: number
  }> {
    return apiFetch(`/anime/recent-episodes?page=${page}`)
  }

  /**
   * Generic GET request method for compatibility
   * Updated with better logging and endpoint handling
   */
  async get(endpoint: string): Promise<any> {
    console.log(`[API] Generic GET request to endpoint: ${endpoint}`)
    
    // Handle both direct calls and calls that expect to use /anime/ prefix
    let finalEndpoint = endpoint
    
    // If the endpoint starts with /anime/ and we're trying to get anime info,
    // convert it to the correct format
    if (endpoint.startsWith('/anime/') && !endpoint.includes('?') && !endpoint.includes('search')) {
      const animeId = endpoint.replace('/anime/', '')
      console.log(`[API] Converting /anime/${animeId} to /anime/info?id=${animeId}`)
      finalEndpoint = `/anime/info?id=${encodeURIComponent(animeId)}`
    }
    
    console.log(`[API] Final endpoint: ${finalEndpoint}`)
    return apiFetch(finalEndpoint)
  }
}

/**
 * Export the API client instance
 */
export const hiAnimeApi = new HiAnimeAPI()

/**
 * Export compatibility alias for existing code
 */
export const apiClient = hiAnimeApi

/**
 * Export error class for error handling
 */
export { HiAnimeAPIError }

/**
 * Compatibility function for existing search page
 * This ensures the search page can continue using `searchAnime` function
 */
export async function searchAnime(query: string): Promise<SearchResult> {
  return hiAnimeApi.searchAnime(query)
}

/**
 * Utility function to handle API errors in components
 */
export function handleAPIError(error: unknown): string {
  if (error instanceof HiAnimeAPIError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}
