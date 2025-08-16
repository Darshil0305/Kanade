'use client';
import React, { useState, useEffect } from 'react';
import { hiAnimeClient } from '@kanade/api';
import Link from 'next/link';
import Image from 'next/image';

interface AnimeResult {
  id: string;
  title: string;
  poster: string;
  type: string;
  sub: number;
  dub: number;
  episodes: {
    sub: number;
    dub: number;
  };
}

interface SearchResponse {
  animes: AnimeResult[];
  mostPopularAnimes: AnimeResult[];
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
}

const AnimeCard: React.FC<{ anime: AnimeResult }> = ({ anime }) => {
  return (
    <Link className="group" href={`/anime/${anime.id}`}>
      <div className="relative flex-shrink-0 w-48 h-72 rounded-lg overflow-hidden bg-gray-800 transition-transform duration-300 group-hover:scale-105 group-hover:z-10">
        <Image
          src={anime.poster}
          alt={anime.title}
          fill
          className="object-cover transition-opacity duration-300 group-hover:opacity-80"
          sizes="(max-width: 768px) 192px, 192px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Hover overlay with details */}
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">
            {anime.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <span className="bg-red-600 px-2 py-1 rounded text-white">
              {anime.type}
            </span>
            {anime.episodes.sub > 0 && (
              <span className="text-green-400">
                SUB: {anime.episodes.sub}
              </span>
            )}
            {anime.episodes.dub > 0 && (
              <span className="text-blue-400">
                DUB: {anime.episodes.dub}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

const HorizontalCarousel: React.FC<{ 
  title: string; 
  animes: AnimeResult[];
  loading?: boolean;
}> = ({ title, animes, loading }) => {
  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
          {[...Array(6)].map((_, i) => (
            <div className="flex-shrink-0 w-48 h-72 rounded-lg bg-gray-700 animate-pulse" key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (animes.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 hover:scrollbar-default">
        {animes.map((anime) => (
          <AnimeCard anime={anime} key={anime.id} />
        ))}
      </div>
    </div>
  );
};

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AnimeResult[]>([]);
  const [popularAnimes, setPopularAnimes] = useState<AnimeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Load popular animes on component mount
  useEffect(() => {
    const loadPopularAnimes = async () => {
      try {
        setLoading(true);
        const response = await hiAnimeClient.searchAnime('', 1); // Empty query for popular
        setPopularAnimes(response.animes.slice(0, 12)); // Show top 12
      } catch (err) {
        console.error('Failed to load popular animes:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPopularAnimes();
  }, []);

  const handleSearch = async (query: string, page = 1) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      
      const response = await hiAnimeClient.searchAnime(query, page);
      
      if (page === 1) {
        setSearchResults(response.animes);
      } else {
        setSearchResults(prev => [...prev, ...response.animes]);
      }
      
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
      setHasNextPage(response.hasNextPage);
    } catch (err) {
      setError('Failed to search anime. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const loadMore = () => {
    if (hasNextPage && !loading && searchQuery.trim()) {
      handleSearch(searchQuery, currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
            Discover Anime
          </h1>
          
          {/* Search Input */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                placeholder="Search for anime..."
                className="w-full px-6 py-4 text-lg bg-gray-800 border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 pl-12"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            
            {loading && hasSearched && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-8">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  clipRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  fillRule="evenodd"
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && (
          <HorizontalCarousel
            title={`Search Results for "${searchQuery}"`}
            animes={searchResults}
            loading={loading && currentPage === 1}
          />
        )}

        {/* Load More Button */}
        {hasSearched && hasNextPage && searchResults.length > 0 && (
          <div className="text-center mb-8">
            <button
              onClick={loadMore}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 rounded-full font-semibold transition-colors duration-300"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}

        {/* No Results */}
        {hasSearched && searchResults.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-xl mb-4">No anime found for "{searchQuery}"</div>
            <div className="text-gray-500">Try searching with different keywords</div>
          </div>
        )}

        {/* Popular Animes (shown when no search or as fallback) */}
        {(!hasSearched || searchResults.length === 0) && (
          <HorizontalCarousel
            title="Popular Anime"
            animes={popularAnimes}
            loading={loading && !hasSearched}
          />
        )}
      </div>
    </div>
  );
};

export default SearchPage;
