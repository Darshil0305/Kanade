"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { KanadeAPIClient } from "../../lib/api-client";

interface AnimeDetails {
  id: string;
  title: string;
  poster: string;
  description: string;
  genres: string[];
  totalEpisodes: number;
  type: string;
  status: string;
  otherNames?: string[];
  studios?: string[];
  producers?: string[];
  aired?: {
    from?: string;
    to?: string;
  };
  duration?: string;
  rating?: string;
  recommendations?: {
    id: string;
    title: string;
    poster: string;
    episodes: {
      sub: number;
      dub: number;
    };
  }[];
  relations?: {
    id: string;
    title: string;
    poster: string;
    type: string;
  }[];
  seasons?: {
    id: string;
    title: string;
    poster: string;
    isCurrent: boolean;
  }[];
}

export default function AnimeDetailsPage() {
  const { id } = useParams();
  const [anime, setAnime] = useState<AnimeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchAnimeDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use KanadeAPIClient.getAnimeDetails method
        const animeDetails = await KanadeAPIClient.getAnimeDetails(id as string);
        setAnime(animeDetails);
      } catch (err) {
        console.error("Error fetching anime details:", err);
        setError("An error occurred while fetching anime details");
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeDetails();
  }, [id]);

  const handleWatchNow = () => {
    // Navigate to the watch page with the anime ID
    window.location.href = `/watch/${id}/1`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="text-6xl mb-4">😓</div>
        <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold mb-2">Anime Not Found</h2>
        <p className="text-gray-400">The anime you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="relative">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Poster */}
            <div className="flex-shrink-0">
              <div className="relative w-80 h-96 mx-auto lg:mx-0 rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={anime.poster}
                  alt={anime.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 text-white">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {anime.title}
              </h1>

              {/* Other Names */}
              {anime.otherNames && anime.otherNames.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Also known as:</h3>
                  <p className="text-gray-300">{anime.otherNames.join(", ")}</p>
                </div>
              )}

              {/* Meta Info */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-gray-400 text-sm">Episodes</p>
                  <p className="text-white font-semibold">{anime.totalEpisodes || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Type</p>
                  <p className="text-white font-semibold">{anime.type}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <p className="text-white font-semibold">{anime.status}</p>
                </div>
                {anime.rating && (
                  <div>
                    <p className="text-gray-400 text-sm">Rating</p>
                    <p className="text-white font-semibold">{anime.rating}</p>
                  </div>
                )}
              </div>

              {/* Genres */}
              {anime.genres && anime.genres.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((genre, index) => (
                      <span
                        key={index}
                        className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium border border-blue-600/30"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Watch Button */}
              <button
                onClick={handleWatchNow}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path>
                </svg>
                Watch Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Synopsis Section */}
      {anime.description && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Synopsis</h2>
            <div className="text-gray-300 leading-relaxed">
              <p className={`${!isDescriptionExpanded && anime.description.length > 300 ? 'line-clamp-4' : ''}`}>
                {anime.description}
              </p>
              {anime.description.length > 300 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-blue-400 hover:text-blue-300 mt-2 font-medium transition-colors"
                >
                  {isDescriptionExpanded ? "Show Less" : "Show More"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seasons Section */}
      {anime.seasons && anime.seasons.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-white mb-6">Seasons</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {anime.seasons.map((season) => (
              <div key={season.id} className="group cursor-pointer">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-800">
                  <Image
                    src={season.poster}
                    alt={season.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {season.isCurrent && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      Current
                    </div>
                  )}
                </div>
                <h3 className="text-white font-medium mt-2 text-sm group-hover:text-blue-400 transition-colors">
                  {season.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Anime Section */}
      {anime.relations && anime.relations.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-white mb-6">Related Anime</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {anime.relations.map((related) => (
              <div key={related.id} className="group cursor-pointer">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-800">
                  <Image
                    src={related.poster}
                    alt={related.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 left-2 bg-gray-900/80 text-white text-xs px-2 py-1 rounded">
                    {related.type}
                  </div>
                </div>
                <h3 className="text-white font-medium mt-2 text-sm group-hover:text-blue-400 transition-colors">
                  {related.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      {anime.recommendations && anime.recommendations.length > 0 && (
        <div className="container mx-auto px-4 py-8 pb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Recommended For You</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {anime.recommendations.map((rec) => (
              <div key={rec.id} className="group cursor-pointer">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-800">
                  <Image
                    src={rec.poster}
                    alt={rec.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 left-2 bg-gray-900/80 text-white text-xs px-2 py-1 rounded">
                    {rec.episodes.sub} Sub | {rec.episodes.dub} Dub
                  </div>
                </div>
                <h3 className="text-white font-medium mt-2 text-sm group-hover:text-blue-400 transition-colors">
                  {rec.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
