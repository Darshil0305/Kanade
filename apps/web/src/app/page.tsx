import React from 'react';
import { Suspense } from 'react';

// Mock data for anime content
const mockAnimeData = {
  featured: {
    id: 1,
    title: "Attack on Titan Final Season",
    description: "The epic conclusion to humanity's fight for survival against the titans. Join Eren, Mikasa, and Armin in their final battle that will determine the fate of the world.",
    image: "/api/placeholder/1920/1080",
    rating: "9.0",
    year: "2023",
    genre: "Action, Drama"
  },
  categories: [
    {
      title: "Trending Now",
      items: [
        { id: 1, title: "Demon Slayer", image: "/api/placeholder/300/450", rating: "8.7" },
        { id: 2, title: "Jujutsu Kaisen", image: "/api/placeholder/300/450", rating: "8.5" },
        { id: 3, title: "One Piece", image: "/api/placeholder/300/450", rating: "9.0" },
        { id: 4, title: "Naruto", image: "/api/placeholder/300/450", rating: "8.9" },
        { id: 5, title: "Death Note", image: "/api/placeholder/300/450", rating: "9.0" },
        { id: 6, title: "My Hero Academia", image: "/api/placeholder/300/450", rating: "8.4" }
      ]
    },
    {
      title: "Popular This Week",
      items: [
        { id: 7, title: "Tokyo Ghoul", image: "/api/placeholder/300/450", rating: "8.2" },
        { id: 8, title: "Bleach", image: "/api/placeholder/300/450", rating: "8.8" },
        { id: 9, title: "Fullmetal Alchemist", image: "/api/placeholder/300/450", rating: "9.1" },
        { id: 10, title: "Hunter x Hunter", image: "/api/placeholder/300/450", rating: "9.0" },
        { id: 11, title: "One Punch Man", image: "/api/placeholder/300/450", rating: "8.7" },
        { id: 12, title: "Dragon Ball Z", image: "/api/placeholder/300/450", rating: "8.9" }
      ]
    },
    {
      title: "Action & Adventure",
      items: [
        { id: 13, title: "Cowboy Bebop", image: "/api/placeholder/300/450", rating: "8.9" },
        { id: 14, title: "Mob Psycho 100", image: "/api/placeholder/300/450", rating: "8.8" },
        { id: 15, title: "Black Clover", image: "/api/placeholder/300/450", rating: "8.3" },
        { id: 16, title: "Fire Force", image: "/api/placeholder/300/450", rating: "8.1" },
        { id: 17, title: "Chainsaw Man", image: "/api/placeholder/300/450", rating: "8.6" },
        { id: 18, title: "Spy x Family", image: "/api/placeholder/300/450", rating: "8.8" }
      ]
    },
    {
      title: "Romance & Drama",
      items: [
        { id: 19, title: "Your Name", image: "/api/placeholder/300/450", rating: "8.4" },
        { id: 20, title: "A Silent Voice", image: "/api/placeholder/300/450", rating: "8.7" },
        { id: 21, title: "Weathering With You", image: "/api/placeholder/300/450", rating: "8.2" },
        { id: 22, title: "Violet Evergarden", image: "/api/placeholder/300/450", rating: "8.5" },
        { id: 23, title: "Clannad", image: "/api/placeholder/300/450", rating: "8.9" },
        { id: 24, title: "Toradora", image: "/api/placeholder/300/450", rating: "8.1" }
      ]
    }
  ]
};

const AnimeCard = ({ anime, isLarge = false }) => {
  const cardClasses = isLarge 
    ? "relative group cursor-pointer transform transition-all duration-300 hover:scale-105 min-w-[200px] md:min-w-[300px]"
    : "relative group cursor-pointer transform transition-all duration-300 hover:scale-105 min-w-[150px] md:min-w-[200px]";
  
  const imageClasses = isLarge
    ? "w-full h-[300px] md:h-[450px] object-cover rounded-lg"
    : "w-full h-[225px] md:h-[300px] object-cover rounded-lg";

  return (
    <div className={cardClasses}>
      <img 
        src={anime.image} 
        alt={anime.title}
        className={imageClasses}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 rounded-lg flex items-end opacity-0 group-hover:opacity-100">
        <div className="p-4 text-white w-full">
          <h3 className={`font-bold mb-2 ${isLarge ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'}`}>
            {anime.title}
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">★</span>
              <span className="text-sm">{anime.rating}</span>
            </div>
            <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-sm font-medium transition-colors">
              Play
            </button>
            <button className="border border-white hover:bg-white hover:text-black px-4 py-2 rounded-full text-sm font-medium transition-colors">
              Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CategoryRow = ({ category }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4 px-4 md:px-12">
        {category.title}
      </h2>
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-4">
        {category.items.map((anime) => (
          <AnimeCard key={anime.id} anime={anime} />
        ))}
      </div>
    </div>
  );
};

const HeroSection = ({ featured }) => {
  return (
    <div className="relative h-[70vh] md:h-[80vh] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={featured.image} 
          alt={featured.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 px-4 md:px-12 max-w-4xl">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-2xl">
          {featured.title}
        </h1>
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-1">
            <span className="text-yellow-400 text-xl">★</span>
            <span className="text-white font-medium">{featured.rating}</span>
          </div>
          <span className="text-gray-300">{featured.year}</span>
          <span className="text-gray-300">{featured.genre}</span>
        </div>
        <p className="text-gray-200 text-lg md:text-xl mb-8 max-w-2xl leading-relaxed">
          {featured.description}
        </p>
        <div className="flex space-x-4">
          <button className="bg-white hover:bg-gray-200 text-black px-8 py-3 rounded-full text-lg font-bold flex items-center space-x-2 transition-colors">
            <span>▶</span>
            <span>Play</span>
          </button>
          <button className="bg-gray-700/70 hover:bg-gray-600/70 text-white px-8 py-3 rounded-full text-lg font-bold flex items-center space-x-2 transition-colors">
            <span>ℹ</span>
            <span>More Info</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-black">
      <div className="h-[80vh] bg-gray-800 animate-pulse" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="mb-8 px-4 md:px-12">
          <div className="h-8 bg-gray-800 rounded w-48 mb-4 animate-pulse" />
          <div className="flex space-x-4 overflow-x-hidden">
            {[1, 2, 3, 4, 5, 6].map((j) => (
              <div key={j} className="min-w-[200px] h-[300px] bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <Suspense fallback={<LoadingSkeleton />}>
        {/* Hero Section */}
        <HeroSection featured={mockAnimeData.featured} />
        
        {/* Category Rows */}
        <div className="pb-12">
          {mockAnimeData.categories.map((category, index) => (
            <CategoryRow key={index} category={category} />
          ))}
        </div>
      </Suspense>
      
      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
