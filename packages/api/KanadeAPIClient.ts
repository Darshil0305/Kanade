/**
 * KanadeAPIClient - A TypeScript client for the HiAnime API
 * 
 * This class provides methods to interact with the HiAnime API for anime streaming.
 * Base API URL: https://hianime-api-qdks.onrender.com/api/v1
 * 
 * @author Kanade Team
 * @version 2.0.0
 */

// ===== TYPE DEFINITIONS =====

/** Search options for anime search */
export interface SearchOptions {
  query: string;
  page?: number;
}

/** Anime item structure returned by API */
export interface AnimeItem {
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

/** Search results structure */
export interface SearchResult {
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

/** Home page data structure */
export interface HomePageData {
  success: boolean;
  data: {
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

/** Detailed anime information */
export interface AnimeDetails {
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

/** Episode information */
export interface Episode {
  title: string;
  alternativeTitle: string;
  id: string;
  isFiller: boolean;
}

/** Episode list response */
export interface EpisodeList {
  success: boolean;
  data: Episode[];
}

/** API Error structure */
export interface APIError {
  success: false;
  error: {
    message: string;
    code?: string;
  };
}

// ===== MAIN CLIENT CLASS =====

export class KanadeAPIClient {
  private baseUrl: string;
  private apiVersion: string;

  constructor(baseUrl = 'https://hianime-api-qdks.onrender.com/api/v1') {
    this.baseUrl = baseUrl;
    this.apiVersion = 'v1';
  }

  /**
   * Search for anime based on query and optional filters
   * @param options - Search options including query, pagination, and filters
   * @returns Promise<SearchResult> - Search results with anime list and pagination info
   */
  async search(options: SearchOptions): Promise<SearchResult> {
    try {
      const params = new URLSearchParams({
        keyword: options.query,
        ...(options.page && { page: options.page.toString() })
      });
      
      const endpoint = `/search?${params.toString()}`;
      const result = await this.makeRequest(endpoint);
      
      return result as SearchResult;
    } catch (error) {
      console.error('Search failed:', error);
      throw new Error(`Failed to search anime: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get trending anime from home page
   * @returns Promise<AnimeItem[]> - List of trending anime
   */
  async getTrendingAnime(): Promise<AnimeItem[]> {
    try {
      const homeData = await this.getHomePageData();
      return homeData.data.trending;
    } catch (error) {
      console.error('Failed to get trending anime:', error);
      throw new Error(`Failed to get trending anime: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get home page data with trending, popular, and other anime lists
   * @returns Promise<HomePageData> - Complete home page data
   */
  async getHomePageData(): Promise<HomePageData> {
    try {
      const result = await this.makeRequest('/home');
      return result as HomePageData;
    } catch (error) {
      console.error('Failed to get home page data:', error);
      throw new Error(`Failed to get home page data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get detailed information about a specific anime
   * @param animeId - The ID of the anime to fetch details for
   * @returns Promise<AnimeDetails> - Detailed anime information
   */
  async getAnimeDetails(animeId: string): Promise<AnimeDetails> {
    try {
      if (!animeId || typeof animeId !== 'string') {
        throw new Error('Valid anime ID is required');
      }

      const endpoint = `/anime/${animeId}`;
      const result = await this.makeRequest(endpoint);
      
      return result as AnimeDetails;
    } catch (error) {
      console.error('Failed to get anime details:', error);
      throw new Error(`Failed to get anime details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get list of episodes for a specific anime
   * @param animeId - The ID of the anime to fetch episodes for
   * @returns Promise<EpisodeList> - List of episodes
   */
  async getEpisodes(animeId: string): Promise<EpisodeList> {
    try {
      if (!animeId || typeof animeId !== 'string') {
        throw new Error('Valid anime ID is required');
      }

      const endpoint = `/episodes/${animeId}`;
      const result = await this.makeRequest(endpoint);
      
      return result as EpisodeList;
    } catch (error) {
      console.error('Failed to get episodes:', error);
      throw new Error(`Failed to get episodes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get anime suggestions based on partial keyword input
   * @param keyword - Partial search query
   * @returns Promise<AnimeItem[]> - List of anime suggestions
   */
  async getSearchSuggestions(keyword: string): Promise<AnimeItem[]> {
    try {
      if (!keyword || typeof keyword !== 'string') {
        throw new Error('Valid keyword is required');
      }

      const params = new URLSearchParams({ keyword });
      const endpoint = `/search/suggestion?${params.toString()}`;
      const result = await this.makeRequest(endpoint);
      
      return result.data as AnimeItem[];
    } catch (error) {
      console.error('Failed to get search suggestions:', error);
      throw new Error(`Failed to get search suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get popular anime list
   * @param page - Page number (optional)
   * @returns Promise<SearchResult> - Popular anime with pagination
   */
  async getPopularAnime(page = 1): Promise<SearchResult> {
    try {
      const endpoint = `/animes/most-popular?page=${page}`;
      const result = await this.makeRequest(endpoint);
      
      return result as SearchResult;
    } catch (error) {
      console.error('Failed to get popular anime:', error);
      throw new Error(`Failed to get popular anime: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get top airing anime list
   * @param page - Page number (optional)
   * @returns Promise<SearchResult> - Top airing anime with pagination
   */
  async getTopAiringAnime(page = 1): Promise<SearchResult> {
    try {
      const endpoint = `/animes/top-airing?page=${page}`;
      const result = await this.makeRequest(endpoint);
      
      return result as SearchResult;
    } catch (error) {
      console.error('Failed to get top airing anime:', error);
      throw new Error(`Failed to get top airing anime: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Private method to make HTTP requests to the API
   * @param endpoint - API endpoint path (should start with /)
   * @param options - Request options
   * @returns Promise<any> - API response
   */
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Kanade/2.0.0 (Anime Streaming Client)',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      // Check if the response indicates an error
      if (data.success === false) {
        throw new Error(data.error?.message || 'API returned error response');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Check if the API is available
   * @returns Promise<boolean> - True if API is available
   */
  async checkAPIHealth(): Promise<boolean> {
    try {
      await this.makeRequest('/home');
      return true;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }

  /**
   * Get the current base URL
   * @returns string - Current base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Update the base URL (useful for switching between API instances)
   * @param newBaseUrl - New base URL to use
   */
  setBaseUrl(newBaseUrl: string): void {
    if (!newBaseUrl || typeof newBaseUrl !== 'string') {
      throw new Error('Valid base URL is required');
    }
    this.baseUrl = newBaseUrl;
  }
}

// Export default instance for convenience
export default new KanadeAPIClient();
