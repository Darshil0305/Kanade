import React, { useState, useEffect } from 'react';
import { Search, Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';

interface Movie {
  id: number;
  title: string;
  image: string;
  description: string;
  year: number;
  rating: string;
}

interface MovieCategory {
  title: string;
  movies: Movie[];
}

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [categories] = useState<MovieCategory[]>([
    {
      title: 'Trending Now',
      movies: [
        { id: 1, title: 'Stranger Things', image: '/api/placeholder/300/450', description: 'A group of young friends witness supernatural forces and secret government exploits.', year: 2016, rating: 'TV-14' },
        { id: 2, title: 'The Crown', image: '/api/placeholder/300/450', description: 'Follows the political rivalries and romance of Queen Elizabeth II\'s reign.', year: 2016, rating: 'TV-MA' },
        { id: 3, title: 'Ozark', image: '/api/placeholder/300/450', description: 'A financial advisor drags his family from Chicago to the Missouri Ozarks.', year: 2017, rating: 'TV-MA' },
        { id: 4, title: 'Bridgerton', image: '/api/placeholder/300/450', description: 'Wealth, lust, and betrayal set in the backdrop of Regency era England.', year: 2020, rating: 'TV-MA' },
        { id: 5, title: 'The Witcher', image: '/api/placeholder/300/450', description: 'Geralt of Rivia, a mutated monster-hunter for hire, journeys toward his destiny.', year: 2019, rating: 'TV-MA' },
      ]
    },
    {
      title: 'Popular Movies',
      movies: [
        { id: 6, title: 'Red Notice', image: '/api/placeholder/300/450', description: 'An FBI profiler pursuing the world\'s most wanted art thief becomes his reluctant partner.', year: 2021, rating: 'PG-13' },
        { id: 7, title: 'Don\'t Look Up', image: '/api/placeholder/300/450', description: 'Two astronomers go on a media tour to warn humankind of a planet-killing comet.', year: 2021, rating: 'R' },
        { id: 8, title: 'The Adam Project', image: '/api/placeholder/300/450', description: 'A time-traveling fighter pilot teams up with his younger self.', year: 2022, rating: 'PG-13' },
        { id: 9, title: 'Enola Holmes', image: '/api/placeholder/300/450', description: 'The teenage sister of the already-famous Sherlock Holmes uses her sleuthing skills.', year: 2020, rating: 'PG-13' },
        { id: 10, title: 'Glass Onion', image: '/api/placeholder/300/450', description: 'Detective Benoit Blanc heads to Greece to peel back the layers of a mystery.', year: 2022, rating: 'PG-13' },
      ]
    },
    {
      title: 'Netflix Originals',
      movies: [
        { id: 11, title: 'House of Cards', image: '/api/placeholder/300/450', description: 'A Congressman works with his equally conniving wife to exact revenge.', year: 2013, rating: 'TV-MA' },
        { id: 12, title: 'Orange Is the New Black', image: '/api/placeholder/300/450', description: 'The story of Piper Chapman, a woman in her thirties who is sentenced to fifteen months.', year: 2013, rating: 'TV-MA' },
        { id: 13, title: 'Narcos', image: '/api/placeholder/300/450', description: 'A chronicled look at the criminal exploits of Colombian drug lord Pablo Escobar.', year: 2015, rating: 'TV-MA' },
        { id: 14, title: 'The Umbrella Academy', image: '/api/placeholder/300/450', description: 'A dysfunctional family of superheroes comes together to solve their father\'s murder.', year: 2019, rating: 'TV-14' },
        { id: 15, title: 'Money Heist', image: '/api/placeholder/300/450', description: 'An unusual group of robbers attempt to carry out the most perfect robbery.', year: 2017, rating: 'TV-MA' },
      ]
    }
  ]);

  const allMovies = categories.flatMap(category => category.movies);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        const filtered = allMovies.filter(movie =>
          movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          movie.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, allMovies]);

  const MovieCard = ({ movie, isLarge = false }: { movie: Movie; isLarge?: boolean }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        className={`relative group cursor-pointer transition-all duration-300 ${
          isLarge ? 'min-w-[300px] h-[450px]' : 'min-w-[200px] h-[300px]'
        } ${
          isHovered ? 'scale-105 z-10' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={movie.image}
          alt={movie.title}
          className="w-full h-full object-cover rounded-md"
        />
        
        {/* Overlay on hover */}
        <div className={`absolute inset-0 bg-black bg-opacity-70 rounded-md transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        } flex flex-col justify-end p-4`}>
          <h3 className="text-white font-bold text-lg mb-2">{movie.title}</h3>
          <p className="text-gray-300 text-sm mb-3 line-clamp-3">{movie.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="bg-gray-700 text-white px-2 py-1 rounded text-xs">{movie.rating}</span>
              <span className="text-gray-400 text-sm">{movie.year}</span>
            </div>
            <div className="flex space-x-2">
              <button className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors">
                <Play size={16} />
              </button>
              <button className="bg-gray-800 bg-opacity-80 text-white p-2 rounded-full hover:bg-gray-700 transition-colors">
                <Info size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const HorizontalCarousel = ({ title, movies }: MovieCategory) => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
      const container = containerRef.current;
      if (!container) return;

      const scrollAmount = 800;
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount);
      
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    };

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-2xl font-bold">{title}</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => scroll('left')}
              className="bg-gray-800 bg-opacity-80 text-white p-2 rounded-full hover:bg-gray-700 transition-colors disabled:opacity-50"
              disabled={scrollPosition === 0}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="bg-gray-800 bg-opacity-80 text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div 
          ref={containerRef}
          className="flex space-x-4 overflow-x-hidden scroll-smooth"
          onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    );
  };

  const SearchResults = () => {
    if (isSearching) {
      return (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      );
    }

    if (searchResults.length === 0) {
      return (
        <div className="text-center py-20">
          <p className="text-gray-400 text-xl">No results found for "{searchQuery}"</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {searchResults.map((movie) => (
          <MovieCard key={movie.id} movie={movie} isLarge={false} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Search Header */}
      <div className="sticky top-0 z-20 bg-black bg-opacity-95 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for movies, TV shows, documentaries and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-full py-4 pl-12 pr-6 text-white placeholder-gray-400 focus:outline-none focus:border-red-600 focus:bg-gray-800 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {searchQuery.trim() ? (
          <div>
            <h1 className="text-3xl font-bold mb-8">
              {isSearching ? 'Searching...' : `Search Results for "${searchQuery}"`}
            </h1>
            <SearchResults />
          </div>
        ) : (
          <div>
            {/* Hero Section */}
            <div className="mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                Discover Amazing Content
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl">
                Search through thousands of movies, TV shows, and documentaries. 
                Find your next binge-watch or discover something completely new.
              </p>
            </div>

            {/* Categories */}
            {categories.map((category) => (
              <HorizontalCarousel key={category.title} {...category} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
