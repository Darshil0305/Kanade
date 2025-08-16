import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  Anime, 
  Episode, 
  EpisodeSources, 
  SearchResult, 
  SearchFilters, 
  ApiResponse, 
  ApiError,
  ClientConfig,
  RequestConfig,
  API_ENDPOINTS,
  Schemas 
} from '@kanade/types';

/**
 * HiAnime API Client
 * A comprehensive TypeScript client for interacting with HiAnime API
 */
export class HiAnimeClient {
  private axios: AxiosInstance;
  private config: Required<ClientConfig>;

  constructor(config: ClientConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'https://hianime.to',
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
      userAgent: config.userAgent || 'Kanade/1.0.0',
      enableLogging: config.enableLogging || false,
      headers: config.headers || {}
    };

    this.axios = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'User-Agent': this.config.userAgent,
        'Content-Type': 'application/json',
        ...this.config.headers
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axios.interceptors.request.use(
      (config) => {
        if (this.config.enableLogging) {
          console.log(`[HiAnime API] ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (this.config.enableLogging) {
          console.error('[HiAnime API] Error:', error.message);
        }
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  private handleApiError(error: any): ApiError {
    if (error.response) {
      return new ApiError(
        error.response.data?.message || error.message,
        error.response.status,
        error.response.data?.code,
        error.response.data
      );
    } else if (error.request) {
      return new ApiError('Network error: No response received', 0, 'NETWORK_ERROR');
    } else {
      return new ApiError(error.message, 0, 'UNKNOWN_ERROR');
    }
  }

  private async makeRequest<T>(
    url: string, 
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.axios.get(url, {
        timeout: config.timeout || this.config.timeout,
        headers: config.headers || {}
      });
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Search for anime with filters
   */
  async search(query: string, filters: SearchFilters = {}): Promise<SearchResult> {
    // Provide default values for required fields
    const searchFilters = {
      ...filters,
      page: filters.page || 1,
      limit: filters.limit || 20
    };

    const params = new URLSearchParams({
      q: query,
      ...searchFilters.genre && { genre: searchFilters.genre.join(',') },
      ...searchFilters.year && { year: searchFilters.year.toString() },
      ...searchFilters.season && { season: searchFilters.season },
      ...searchFilters.status && { status: searchFilters.status },
      ...searchFilters.type && { type: searchFilters.type },
      ...searchFilters.sort && { sort: searchFilters.sort },
      page: searchFilters.page.toString(),
      limit: searchFilters.limit.toString()
    });

    const response = await this.makeRequest<SearchResult>(
      `${API_ENDPOINTS.SEARCH}?${params.toString()}`
    );

    if (!response.success || !response.data) {
      throw new ApiError('Search failed', 0, 'SEARCH_ERROR');
    }

    // Validate response data
    const validatedData = Schemas.SearchResult.parse(response.data);
    return validatedData;
  }

  /**
   * Get detailed information about a specific anime
   */
  async getAnimeInfo(animeId: string): Promise<Anime> {
    if (!animeId) {
      throw new ApiError('Anime ID is required', 400, 'INVALID_PARAM');
    }

    const response = await this.makeRequest<Anime>(
      `${API_ENDPOINTS.ANIME_INFO}/${animeId}`
    );

    if (!response.success || !response.data) {
      throw new ApiError('Failed to fetch anime information', 0, 'ANIME_INFO_ERROR');
    }

    // Validate response data
    const validatedData = Schemas.Anime.parse(response.data);
    return validatedData;
  }

  /**
   * Get episode list for a specific anime
   */
  async getEpisodes(animeId: string): Promise<Episode[]> {
    if (!animeId) {
      throw new ApiError('Anime ID is required', 400, 'INVALID_PARAM');
    }

    const response = await this.makeRequest<Episode[]>(
      `${API_ENDPOINTS.EPISODES}/${animeId}`
    );

    if (!response.success || !response.data) {
      throw new ApiError('Failed to fetch episodes', 0, 'EPISODES_ERROR');
    }

    // Validate response data
    const validatedData = response.data.map(episode => Schemas.Episode.parse(episode));
    return validatedData;
  }

  /**
   * Get streaming sources for a specific episode
   */
  async getEpisodeSources(episodeId: string): Promise<EpisodeSources> {
    if (!episodeId) {
      throw new ApiError('Episode ID is required', 400, 'INVALID_PARAM');
    }

    const response = await this.makeRequest<EpisodeSources>(
      `${API_ENDPOINTS.EPISODE_SOURCES}/${episodeId}`
    );

    if (!response.success || !response.data) {
      throw new ApiError('Failed to fetch episode sources', 0, 'SOURCES_ERROR');
    }

    // Validate response data
    const validatedData = Schemas.EpisodeSources.parse(response.data);
    return validatedData;
  }

  /**
   * Get trending anime
   */
  async getTrending(page: number = 1, limit: number = 20): Promise<SearchResult> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await this.makeRequest<SearchResult>(
      `${API_ENDPOINTS.TRENDING}?${params.toString()}`
    );

    if (!response.success || !response.data) {
      throw new ApiError('Failed to fetch trending anime', 0, 'TRENDING_ERROR');
    }

    const validatedData = Schemas.SearchResult.parse(response.data);
    return validatedData;
  }

  /**
   * Get popular anime
   */
  async getPopular(page: number = 1, limit: number = 20): Promise<SearchResult> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await this.makeRequest<SearchResult>(
      `${API_ENDPOINTS.POPULAR}?${params.toString()}`
    );

    if (!response.success || !response.data) {
      throw new ApiError('Failed to fetch popular anime', 0, 'POPULAR_ERROR');
    }

    const validatedData = Schemas.SearchResult.parse(response.data);
    return validatedData;
  }

  /**
   * Get recently updated anime
   */
  async getRecent(page: number = 1, limit: number = 20): Promise<SearchResult> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await this.makeRequest<SearchResult>(
      `${API_ENDPOINTS.RECENT}?${params.toString()}`
    );

    if (!response.success || !response.data) {
      throw new ApiError('Failed to fetch recent anime', 0, 'RECENT_ERROR');
    }

    const validatedData = Schemas.SearchResult.parse(response.data);
    return validatedData;
  }

  /**
   * Get a random anime
   */
  async getRandom(): Promise<Anime> {
    const response = await this.makeRequest<Anime>(API_ENDPOINTS.RANDOM);

    if (!response.success || !response.data) {
      throw new ApiError('Failed to fetch random anime', 0, 'RANDOM_ERROR');
    }

    const validatedData = Schemas.Anime.parse(response.data);
    return validatedData;
  }

  /**
   * Get available genres
   */
  async getGenres(): Promise<string[]> {
    const response = await this.makeRequest<string[]>(API_ENDPOINTS.GENRES);

    if (!response.success || !response.data) {
      throw new ApiError('Failed to fetch genres', 0, 'GENRES_ERROR');
    }

    return response.data;
  }

  /**
   * Update client configuration
   */
  updateConfig(newConfig: Partial<ClientConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update axios instance if needed
    if (newConfig.baseUrl) {
      this.axios.defaults.baseURL = newConfig.baseUrl;
    }
    
    if (newConfig.timeout) {
      this.axios.defaults.timeout = newConfig.timeout;
    }
    
    if (newConfig.headers) {
      this.axios.defaults.headers = {
        ...this.axios.defaults.headers,
        ...newConfig.headers
      };
    }
  }

  /**
   * Get current client configuration
   */
  getConfig(): Required<ClientConfig> {
    return { ...this.config };
  }
}

// Export a default instance for convenience
export const hianimeClient = new HiAnimeClient();

// Export the class and utilities
export default HiAnimeClient;
export { ApiError } from '@kanade/types';
