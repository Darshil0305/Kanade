'use client';
import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDebounce } from '../../hooks/useDebounce';
import { searchAnime, hiAnimeApi, Anime } from '../../../lib/api-client';

interface AnimeResult extends Anime {}

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
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
    <div className="aspect-[3/4] relative">
      <img
        src={anime.poster || anime.image}
        alt={anime.title}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/placeholder-anime.jpg'; // fallback image
        }}
      />
      <div className="absolute top-2 left-2">
        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">{anime.type}</span>
      </div>
    </div>
    <div className="p-3">
      <h3 className="font-semibold text-sm mb-2 line-clamp-2" title={anime.title}>{anime.title}</h3>
      <div className="flex justify-between text-xs text-gray-500">
        <span>SUB: {anime.sub || 0}</span>
        <span>DUB: {anime.dub || 0}</span>
        <span>EPS: {anime.eps || anime.totalEpisodes || 0}</span>
      </div>
    </div>
  </div>
);

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<AnimeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const debouncedQuery = useDebounce(query, 500);
  
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      const response = await hiAnimeApi.searchAnime(searchQuery);
      setResults(response.animes || []);
    } catch (err) {
      setError('Failed to search anime. Please try again.');
      setResults([]);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);
  
  const handleRetry = () => performSearch(debouncedQuery);
  
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
      
      <div className="mb-4">
        {hasSearched && !loading && (
          <p className="text-gray-600">
            {results.length > 0 ? `Found ${results.length} results` : 'No results found'}
          </p>
        )}
      </div>
      
      {loading && <SearchSkeleton />}
      
      {error && !loading && <ErrorState error={error} onRetry={handleRetry} />}
      
      {!loading && !error && results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {results.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      )}
      
      {!loading && !error && hasSearched && results.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No anime found</div>
          <div className="text-gray-400">Try searching with different keywords</div>
        </div>
      )}
    </div>
  );
}
