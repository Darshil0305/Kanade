import React from 'react';
import { Anime } from '../lib/api-client';

interface AnimeCardProps {
  anime: Anime;
  onClick?: () => void;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105 transition-transform duration-200"
      onClick={onClick}
    >
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
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
            {anime.type}
          </span>
        </div>
        {anime.rating && (
          <div className="absolute top-2 right-2">
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
              ★ {anime.rating}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2" title={anime.title}>
          {anime.title}
        </h3>
        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
          <span>SUB: {anime.sub || 0}</span>
          <span>DUB: {anime.dub || 0}</span>
          <span>EPS: {anime.eps || anime.totalEpisodes || 0}</span>
        </div>
        {anime.status && (
          <div className="text-xs text-gray-600 mb-1">
            Status: <span className="font-medium">{anime.status}</span>
          </div>
        )}
        {anime.genres && anime.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {anime.genres.slice(0, 3).map((genre, index) => (
              <span 
                key={index} 
                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
              >
                {genre}
              </span>
            ))}
            {anime.genres.length > 3 && (
              <span className="text-gray-500 text-xs">+{anime.genres.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimeCard;
export type { AnimeCardProps };
