'use client';
import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useDebounce } from '../../hooks/useDebounce';
import { hiAnimeApi, Anime, handleAPIError } from '../../../lib/api-client';

interface AnimeResult {
  id: string;
  title: string;
  image: string;
  type: string;
  rating?: string;
  releaseDate?: string;
}

const SearchSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
    {Array(20).fill(0).map((_, i) => (
      <div className="bg-gray-200 animate-pulse rounded-lg" key={i}>
        <div className="aspect-[3/4] bg-gray-300 rounded-lg mb-2"></div>
        <div className="h-4 bg-gray-300 rounded mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-3/4"></div>
      </div>
    ))}
  </div>
);

const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="text-center py-12">
    <div className="text-red-500 text-lg mb-4">{error}</div>
    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md" onClick={onRetry}>
      Try Again
    </button>
  </div>
);

const AnimeCard = ({ anime }: { anime: AnimeResult }) => (
  <Link href={`/anime/${anime.id}`} className="block">
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[3/4] relative">
        <img
          src={anime.image}
          alt={anime.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">{anime.type}</span>
        </div>
        {anime.rating && (
          <div className="absolute top-2 right-2">
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">★ {anime.rating}</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2" title={anime.title}>{anime.title}</h3>
        {anime.releaseDate && (
          <div className="text-xs text-gray-500">
            {anime.releaseDate}
          </div>
        )}
      </div>
    </div>
  </Link>
);

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<AnimeResult[]>([]);
  const [trendingAnime, setTrendingAnime] = useState<AnimeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const debouncedQuery = useDebounce(query, 500);
  
  // Load trending anime on initial load
  useEffect(() => {
    const loadTrendingAnime = async () => {
      setTrendingLoading(true);
      try {
        const response = await hiAnimeApi.getTrendingAnime(1);
        setTrendingAnime(response.animes || []);
      } catch (err) {
        console.error('Failed to load trending anime:', err);
        // Don't show error for trending anime, just fail silently
      } finally {
        setTrendingLoading(false);
      }
    };
    
    loadTrendingAnime();
  }, []);
  
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      setError(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      const response = await hiAnimeApi.searchAnime(searchQuery);
      setResults(response.animes || []);
    } catch (err) {
      setError(handleAPIError(err));
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);
  
  const handleRetry = () => {
    if (hasSearched) {
      performSearch(debouncedQuery);
    }
  };
  
  const showTrending = !hasSearched && !query.trim() && !loading;
  const currentResults = hasSearched ? results : [];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Search Anime</h1>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for anime..."
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Show trending anime when no search query */}
      {showTrending && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Trending Anime</h2>
          {trendingLoading && <SearchSkeleton />}
          {!trendingLoading && trendingAnime.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {trendingAnime.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          )}
          {!trendingLoading && trendingAnime.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Unable to load trending anime at the moment.
            </div>
          )}
        </div>
      )}
      
      {/* Search results section */}
      {hasSearched && (
        <div className="mb-4">
          {!loading && (
            <p className="text-gray-600">
              {currentResults.length > 0 
                ? `Found ${currentResults.length} results for "${query}"` 
                : `No results found for "${query}"`
              }
            </p>
          )}
        </div>
      )}
      
      {loading && <SearchSkeleton />}
      
      {error && !loading && <ErrorState error={error} onRetry={handleRetry} />}
      
      {!loading && !error && hasSearched && currentResults.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {currentResults.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      )}
      
      {!loading && !error && hasSearched && currentResults.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No anime found</div>
          <div className="text-gray-400">Try searching with different keywords</div>
        </div>
      )}
    </div>
  );
}
