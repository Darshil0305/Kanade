'use client';
import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDebounce } from '../../hooks/useDebounce';
import { hiAnimeApi, Anime } from '../../../lib/api-client';
import AnimeCard from '../../components/AnimeCard';

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

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Anime[]>([]);
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
            Search Anime
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Discover your favorite anime series and movies
          </p>
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for anime..."
              className="block w-full pl-10 pr-12 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
            {loading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          {hasSearched && !loading && (
            <div className="text-center">
              <p className="text-gray-600 text-lg">
                {results.length > 0 ? (
                  <span className="font-medium text-gray-900">
                    Found {results.length} results for "{debouncedQuery}"
                  </span>
                ) : (
                  <span className="text-gray-500">No results found for "{debouncedQuery}"</span>
                )}
              </p>
            </div>
          )}
        </div>
        
        {loading && <SearchSkeleton />}
        
        {error && !loading && (
          <ErrorState error={error} onRetry={handleRetry} />
        )}
        
        {!loading && !error && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {results.map((anime) => (
              <AnimeCard 
                key={anime.id} 
                anime={anime}
                onClick={() => {
                  // TODO: Navigate to anime details page
                  console.log('Navigate to anime:', anime.id);
                }}
              />
            ))}
          </div>
        )}
        
        {!loading && !error && hasSearched && results.length === 0 && (
          <div className="text-center py-16">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.137 0-4.146-.832-5.618-2.218C6.87 13.042 6.9 13.1 7 13c0-5.523 4.477-10 10-10s10 4.477 10 10c0 .9-.12 1.775-.344 2.618A7.959 7.959 0 0112 21c-4.418 0-8-3.582-8-8a8 8 0 018-8z" />
            </svg>
            <div className="text-gray-500 text-xl mb-2">No anime found</div>
            <div className="text-gray-400 mb-4">Try searching with different keywords</div>
            <p className="text-sm text-gray-400">
              Popular searches: Naruto, Attack on Titan, One Piece, Demon Slayer
            </p>
          </div>
        )}
        
        {!hasSearched && !loading && (
          <div className="text-center py-16">
            <svg className="mx-auto h-20 w-20 text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <div className="text-gray-500 text-xl mb-2">Start your anime search</div>
            <div className="text-gray-400">Enter a title above to find your favorite anime</div>
          </div>
        )}
      </div>
    </div>
  );
}
