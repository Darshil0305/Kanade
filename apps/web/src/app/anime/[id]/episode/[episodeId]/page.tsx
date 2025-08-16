'use client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Hls from 'hls.js';
import { hiAnimeApi } from '@/lib/hiAnimeApi';

interface EpisodeSource {
  url: string;
  quality: string;
  isM3U8: boolean;
}

interface EpisodeData {
  sources: EpisodeSource[];
  subtitles?: Array<{
    file: string;
    label: string;
    kind: string;
  }>;
}

export default function EpisodeWatchPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [episodeData, setEpisodeData] = useState<EpisodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuality, setCurrentQuality] = useState<string>('auto');
  
  const animeId = params?.id as string;
  const episodeId = params?.episodeId as string;
  const episodeNumber = searchParams.get('ep') || '1';
  
  useEffect(() => {
    const fetchEpisodeSources = async () => {
      if (!animeId || !episodeId) {
        setError('Missing anime or episode ID');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const sources = await hiAnimeApi.getEpisodeSources(episodeId);
        
        if (!sources || sources.length === 0) {
          setError('No video sources available for this episode');
          setLoading(false);
          return;
        }
        
        setEpisodeData({ sources });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching episode sources:', err);
        setError('Failed to load episode sources. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchEpisodeSources();
  }, [animeId, episodeId]);
  
  useEffect(() => {
    if (!episodeData?.sources || !videoRef.current) return;
    
    // Find the best quality source
    const m3u8Sources = episodeData.sources.filter(source => source.isM3U8);
    const selectedSource = m3u8Sources[0] || episodeData.sources[0];
    
    if (!selectedSource) {
      setError('No compatible video source found');
      return;
    }
    
    const video = videoRef.current;
    
    // Initialize HLS player for adaptive streaming
    if (selectedSource.isM3U8 && Hls.isSupported()) {
      // Destroy previous HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      
      hlsRef.current = hls;
      
      hls.loadSource(selectedSource.url);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest loaded, starting playback');
      });
      
      hls.on(Hls.Events.ERROR, (event: string, data: Hls.ErrorData) => {
        console.error('HLS Error:', data);
        if (data.fatal) {
          setError(`Playback error: ${data.details}`);
        }
      });
      
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = selectedSource.url;
    } else {
      // Fallback for non-HLS sources
      video.src = selectedSource.url;
    }
    
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [episodeData]);
  
  const handlePreviousEpisode = () => {
    const prevEpisode = parseInt(episodeNumber) - 1;
    if (prevEpisode >= 1) {
      router.push(`/anime/${animeId}/episode/${animeId}-episode-${prevEpisode}?ep=${prevEpisode}`);
    }
  };
  
  const handleNextEpisode = () => {
    const nextEpisode = parseInt(episodeNumber) + 1;
    router.push(`/anime/${animeId}/episode/${animeId}-episode-${nextEpisode}?ep=${nextEpisode}`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading episode...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Playback Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => router.push(`/anime/${animeId}`)}
              className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg transition-colors"
            >
              Back to Anime
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Video Player */}
      <div className="relative bg-black">
        <video
          ref={videoRef}
          className="w-full aspect-video"
          controls
          preload="metadata"
          crossOrigin="anonymous"
          onError={(e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
            console.error('Video error:', e);
            setError('Video playback failed. The source might be unavailable.');
          }}
        >
          {episodeData?.subtitles?.map((subtitle, index) => (
            <track
              key={index}
              kind={subtitle.kind as TextTrackKind}
              src={subtitle.file}
              label={subtitle.label}
              srcLang={subtitle.label.toLowerCase()}
            />
          ))}
          Your browser does not support the video tag.
        </video>
        
        {/* Video Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              Loading video...
            </div>
          </div>
        )}
      </div>
      
      {/* Episode Info & Controls */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Episode {episodeNumber}
            </h1>
            <p className="text-gray-400">
              {episodeData?.sources?.length || 0} source(s) available
            </p>
          </div>
          
          {/* Quality Selector */}
          {episodeData?.sources && episodeData.sources.length > 1 && (
            <div className="mt-4 md:mt-0">
              <label className="block text-sm font-medium mb-2">Quality:</label>
              <select
                value={currentQuality}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrentQuality(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="auto">Auto</option>
                {episodeData.sources.map((source, index) => (
                  <option key={index} value={source.quality}>
                    {source.quality}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        {/* Episode Navigation */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={handlePreviousEpisode}
            disabled={parseInt(episodeNumber) <= 1}
            className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg transition-colors"
          >
            <span>←</span>
            <span>Previous Episode</span>
          </button>
          
          <span className="px-4 py-2 bg-blue-600 rounded-lg font-medium">
            EP {episodeNumber}
          </span>
          
          <button
            onClick={handleNextEpisode}
            className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-lg transition-colors"
          >
            <span>Next Episode</span>
            <span>→</span>
          </button>
        </div>
        
        {/* Back to Anime Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push(`/anime/${animeId}`)}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg transition-colors font-medium"
          >
            Back to Anime Details
          </button>
        </div>
      </div>
    </div>
  );
}
