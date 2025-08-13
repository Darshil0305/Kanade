'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { hiAnimeApi } from '../lib/api-client'

interface Anime {
  id: string
  title: string
  image: string
  type: string
  rating?: string
  releaseDate?: string
}

interface HomeData {
  spotlightAnimes?: Anime[]
  trendingAnimes?: Anime[]
  latestEpisodeAnimes?: Anime[]
  topUpcomingAnimes?: Anime[]
}

export default function HomePage() {
  const [homeData, setHomeData] = useState<HomeData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true)
        const data = await hiAnimeApi.getHomeData()
        setHomeData(data)
      } catch (err) {
        setError('Failed to load home data')
        console.error('Home data error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHomeData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
        <span className="ml-2">Loading anime data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const AnimeSection = ({ title, animes }: { title: string; animes?: Anime[] }) => {
    if (!animes || animes.length === 0) return null

    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {animes.slice(0, 12).map((anime) => (
            <div key={anime.id} className="anime-card">
              <Link href={`/anime/${anime.id}`}>
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={anime.image}
                    alt={anime.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <h3 className="anime-title">{anime.title}</h3>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{anime.type}</span>
                    {anime.rating && <span>⭐ {anime.rating}</span>}
                  </div>
                  {anime.releaseDate && (
                    <p className="text-xs text-gray-400 mt-1">{anime.releaseDate}</p>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg p-8 mb-12 text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome to Kanade 🎌</h1>
        <p className="text-xl opacity-90 mb-6">
          Discover and stream your favorite anime series
        </p>
        <Link 
          href="/search"
          className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
        >
          Start Exploring
        </Link>
      </div>

      {/* Anime Sections */}
      <AnimeSection title="🔥 Spotlight Anime" animes={homeData.spotlightAnimes} />
      <AnimeSection title="📈 Trending Now" animes={homeData.trendingAnimes} />
      <AnimeSection title="📺 Latest Episodes" animes={homeData.latestEpisodeAnimes} />
      <AnimeSection title="🔜 Coming Soon" animes={homeData.topUpcomingAnimes} />
    </div>
  )
}
