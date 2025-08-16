'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { hianimeClient as hiAnimeApi, ApiError } from '@kanade/api'

// Helper function to handle API errors
const handleAPIError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unknown error occurred'
}

interface Anime {
  id: string
  title: string
  image: string
  type: string
  rating?: string
  releaseDate?: string
  status?: string
  totalEpisodes?: number
}

interface HomeData {
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
 * Enhanced HomePage component with improved error handling and UI components
 * 
 * Features:
 * - Better loading states with spinner
 * - Comprehensive error handling
 * - Enhanced anime card display
 * - Responsive design improvements
 * - SEO-friendly structure
 */
export default function HomePage() {
  const [homeData, setHomeData] = useState<HomeData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await hiAnimeApi.getHomeData()
        setHomeData(data)
      } catch (err) {
        const errorMessage = handleAPIError(err)
        setError(errorMessage)
        console.error('Home data error:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchHomeData()
  }, [])

  // Loading state component
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <span className="text-gray-600 dark:text-gray-300 text-lg">Loading anime data...</span>
        </div>
      </div>
    )
  }

  // Error state component
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Enhanced AnimeCard component for better display
  const AnimeCard = ({ anime }: { anime: Anime }) => (
    <Link className="group block" href={`/anime/${anime.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-200 dark:bg-gray-700">
          <Image
            src={anime.image || '/placeholder-anime.jpg'}
            alt={`${anime.title} poster`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/placeholder-anime.jpg'
            }}
          />
          {anime.status && (
            <div className="absolute top-2 left-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                anime.status === 'Completed' ? 'bg-green-500' :
                anime.status === 'Ongoing' ? 'bg-blue-500' :
                anime.status === 'Upcoming' ? 'bg-purple-500' :
                'bg-gray-500'
              }`}>
                {anime.status}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center mb-2 mx-auto">
                <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 5v10l8-5-8-5z"></path>
                </svg>
              </div>
              <span className="text-sm font-medium">View Details</span>
            </div>
          </div>
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 min-h-[2.5rem] group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {anime.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              {anime.type && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {anime.type}
                </span>
              )}
              {anime.rating && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  {anime.rating}
                </span>
              )}
            </div>
          </div>
          {anime.releaseDate && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {anime.releaseDate}
            </p>
          )}
        </div>
      </div>
    </Link>
  )

  // Enhanced AnimeSection component
  const AnimeSection = ({ title, animes, emoji }: { title: string; animes?: Anime[]; emoji: string }) => {
    if (!animes || animes.length === 0) return null
    
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">{emoji}</span>
            {title}
          </h2>
          {animes.length > 12 && (
            <Link
              href={`/browse?category=${title.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm transition-colors"
            >
              View All
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {animes.slice(0, 16).map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Kanade <span className="text-5xl md:text-7xl">🎌</span>
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-3xl mx-auto">
              Discover and stream your favorite anime series with our high-quality streaming platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/search"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}></path>
                </svg>
                Start Exploring
              </Link>
              <Link
                href="/trending"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors inline-flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}></path>
                </svg>
                View Trending
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimeSection title="Spotlight Anime" animes={homeData.spotlightAnimes} emoji="🔥" />
        <AnimeSection title="Trending Now" animes={homeData.trendingAnimes} emoji="📈" />
        <AnimeSection title="Latest Episodes" animes={homeData.latestEpisodeAnimes} emoji="📺" />
        <AnimeSection title="Coming Soon" animes={homeData.topUpcomingAnimes} emoji="🔜" />
        <AnimeSection title="Top Airing" animes={homeData.topAiringAnimes} emoji="🎭" />
        <AnimeSection title="Most Popular" animes={homeData.mostPopularAnimes} emoji="⭐" />
        <AnimeSection title="Most Favorite" animes={homeData.mostFavoriteAnimes} emoji="💖" />
        <AnimeSection title="Recently Completed" animes={homeData.latestCompletedAnimes} emoji="✅" />
      </div>
    </div>
  )
}
