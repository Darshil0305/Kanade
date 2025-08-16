'use client';

import { useEffect, useState } from 'react';
import { hiAnimeClient } from '@kanade/api';
import Image from 'next/image';
import Link from 'next/link';

interface Anime {
  id: string;
  title: string;
  poster: string;
  sub: number;
  dub: number;
  episodes: {
    sub: number;
    dub: number;
  };
  type: string;
}

interface HomeData {
  mostPopularAnimes: Anime[];
  topUpcomingAnimes: Anime[];
  topAiringAnimes: Anime[];
  mostFavoriteAnimes: Anime[];
  latestCompletedAnimes: Anime[];
  latestEpisodeAnimes: Anime[];
  trendingAnimes: Anime[];
  genres: string[];
}

interface AnimeCarouselProps {
  title: string;
  animes: Anime[];
  isLoading: boolean;
}

const AnimeCarousel = ({ title, animes, isLoading }: AnimeCarouselProps) => {
  if (isLoading) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="min-w-[200px] bg-gray-800 animate-pulse rounded-lg">
              <div className="aspect-[2/3] bg-gray-700 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
        {animes.map((anime, index) => (
          <Link href={`/anime/${anime.id}`} key={anime.id || index}>
            <div className="min-w-[200px] group cursor-pointer transition-transform hover:scale-105">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                <Image
                  src={anime.poster}
                  alt={anime.title}
                  fill
                  className="object-cover transition-opacity group-hover:opacity-80"
                  sizes="200px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex gap-2 text-xs">
                      {anime.episodes?.sub > 0 && (
                        <span className="bg-red-600 px-2 py-1 rounded text-white">
                          SUB: {anime.episodes.sub}
                        </span>
                      )}
                      {anime.episodes?.dub > 0 && (
                        <span className="bg-blue-600 px-2 py-1 rounded text-white">
                          DUB: {anime.episodes.dub}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-white text-sm font-medium line-clamp-2 mb-1">
                {anime.title}
              </h3>
              <p className="text-gray-400 text-xs">{anime.type}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const HeroSection = ({ anime, isLoading }: { anime?: Anime; isLoading: boolean }) => {
  if (isLoading || !anime) {
    return (
      <div className="relative h-[60vh] bg-gray-900 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-8 max-w-2xl">
          <div className="h-12 bg-gray-700 rounded mb-4 w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded mb-4 w-2/3"></div>
          <div className="flex gap-4">
            <div className="h-12 bg-gray-700 rounded w-32"></div>
            <div className="h-12 bg-gray-700 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[60vh] overflow-hidden">
      <Image
        src={anime.poster}
        alt={anime.title}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-8 max-w-2xl">
        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
          {anime.title}
        </h1>
        <div className="flex gap-4 mb-4">
          {anime.episodes?.sub > 0 && (
            <span className="bg-red-600 px-3 py-1 rounded text-white text-sm">
              SUB: {anime.episodes.sub} Episodes
            </span>
          )}
          {anime.episodes?.dub > 0 && (
            <span className="bg-blue-600 px-3 py-1 rounded text-white text-sm">
              DUB: {anime.episodes.dub} Episodes
            </span>
          )}
          <span className="bg-gray-600 px-3 py-1 rounded text-white text-sm">
            {anime.type}
          </span>
        </div>
        <div className="flex gap-4">
          <Link href={`/anime/${anime.id}`}>
            <button className="bg-white text-black px-8 py-3 rounded font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 5v10l7-5z"/>
              </svg>
              Watch Now
            </button>
          </Link>
          <button className="bg-gray-600/80 text-white px-8 py-3 rounded font-semibold hover:bg-gray-600 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add to List
          </button>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);
        const data = await hiAnimeClient.getHomeData();
        setHomeData(data);
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError('Failed to load anime data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 px-6 py-3 rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const heroAnime = homeData?.trendingAnimes?.[0] || homeData?.mostPopularAnimes?.[0];

  return (
    <div className="min-h-screen bg-black">
      <HeroSection anime={heroAnime} isLoading={isLoading} />
      
      <div className="px-8 py-8">
        <AnimeCarousel
          title="Trending Now"
          animes={homeData?.trendingAnimes || []}
          isLoading={isLoading}
        />
        
        <AnimeCarousel
          title="Most Popular"
          animes={homeData?.mostPopularAnimes || []}
          isLoading={isLoading}
        />
        
        <AnimeCarousel
          title="Top Airing"
          animes={homeData?.topAiringAnimes || []}
          isLoading={isLoading}
        />
        
        <AnimeCarousel
          title="Latest Episodes"
          animes={homeData?.latestEpisodeAnimes || []}
          isLoading={isLoading}
        />
        
        <AnimeCarousel
          title="Most Favorites"
          animes={homeData?.mostFavoriteAnimes || []}
          isLoading={isLoading}
        />
        
        <AnimeCarousel
          title="Recently Completed"
          animes={homeData?.latestCompletedAnimes || []}
          isLoading={isLoading}
        />
        
        <AnimeCarousel
          title="Coming Soon"
          animes={homeData?.topUpcomingAnimes || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
