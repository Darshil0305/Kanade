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
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Kanade/1.0.0',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new HiAnimeAPIError(
        `API request failed: ${response.status} ${response.statusText} - ${errorText}`,
        response.status,
        endpoint
      )
    }

    const data = await response.json()
    
    // Check if the API returned an error in the response body
    if (data.error || data.status === false) {
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
  type: string
  rating?: string
  releaseDate?: string
  status?: string
  genres?: string[]
  description?: string
  totalEpisodes?: number
  duration?: string
}

export interface AnimeDetails {
  id: string
  title: string
  poster: string
  description: string
  genres: string[]
  totalEpisodes: number
  type: string
  status: string
  otherNames?: string[]
  studios?: string[]
  producers?: string[]
  aired?: {
    from?: string
    to?: string
  }
  duration?: string
  rating?: string
  recommendations?: {
    id: string
    title: string
    poster: string
    episodes: {
      sub: number
      dub: number
    }
  }[]
  relations?: {
    id: string
    title: string
    poster: string
    type: string
  }[]
  seasons?: {
    id: string
    title: string
    poster: string
    isCurrent: boolean
  }[]
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

    return apiFetch<SearchResult>(`/anime/search?${params.toString()}`)
  }

  /**
   * Get detailed information about an anime
   */
  async getAnimeInfo(animeId: string): Promise<{
    anime: Anime & {
      episodes: Episode[]
      recommendations?: Anime[]
      relations?: Anime[]
    }
  }> {
    return apiFetch(`/anime/info?id=${encodeURIComponent(animeId)}`)
  }

  /**
   * Get detailed information about an anime (alias for compatibility)
   * This method maps the API response to match the expected AnimeDetails interface
   */
  async getAnimeDetails(animeId: string): Promise<AnimeDetails> {
    try {
      const response = await apiFetch(`/anime/info?id=${encodeURIComponent(animeId)}`)
      
      // Map the API response to our AnimeDetails interface
      const animeData = response.anime || response
      
      return {
        id: animeData.id || animeId,
        title: animeData.title || animeData.name || 'Unknown Title',
        poster: animeData.image || animeData.poster || '',
        description: animeData.description || animeData.synopsis || '',
        genres: animeData.genres || [],
        totalEpisodes: animeData.totalEpisodes || animeData.episodes?.length || 0,
        type: animeData.type || 'Unknown',
        status: animeData.status || 'Unknown',
        otherNames: animeData.otherNames || animeData.synonyms || [],
        studios: animeData.studios || [],
        producers: animeData.producers || [],
        aired: animeData.aired || {},
        duration: animeData.duration || '',
        rating: animeData.rating || animeData.score || '',
        recommendations: animeData.recommendations?.map((rec: any) => ({
          id: rec.id,
          title: rec.title || rec.name,
          poster: rec.image || rec.poster,
          episodes: {
            sub: rec.episodes?.sub || rec.subEpisodes || 0,
            dub: rec.episodes?.dub || rec.dubEpisodes || 0
          }
        })) || [],
        relations: animeData.relations?.map((rel: any) => ({
          id: rel.id,
          title: rel.title || rel.name,
          poster: rel.image || rel.poster,
          type: rel.type || 'Related'
        })) || [],
        seasons: animeData.seasons?.map((season: any) => ({
          id: season.id,
          title: season.title || season.name,
          poster: season.image || season.poster,
          isCurrent: season.isCurrent || false
        })) || []
      }
    } catch (error) {
      console.error('Error fetching anime details:', error)
      throw error
    }
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
}

/**
 * Export the API client instance with both names for compatibility
 */
export const hiAnimeApi = new HiAnimeAPI()
export const KanadeAPIClient = new HiAnimeAPI()

/**
 * Export error class for error handling
 */
export { HiAnimeAPIError }

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
