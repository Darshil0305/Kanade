'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import Hls from 'hls.js';

interface Episode {
  id: string;
  number: number;
  title: string;
  isFiller?: boolean;
}

interface Server {
  name: string;
  url: string;
}

interface StreamData {
  headers: { [key: string]: string };
  sources: { url: string; isM3U8: boolean }[];
  tracks: {
    file: string;
    label: string;
    kind: string;
    default?: boolean;
  }[];
  intro?: {
    start: number;
    end: number;
  };
  outro?: {
    start: number;
    end: number;
  };
}

interface AnimeData {
  info: {
    id: string;
    name: string;
    poster: string;
  };
  episodes: Episode[];
}

export default function WatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const episodeId = params.episodeId as string;
  const animeId = searchParams.get('anime');
  
  const [animeData, setAnimeData] = useState<AnimeData | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [isSubbed, setIsSubbed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Fetch anime episodes
  useEffect(() => {
    if (!animeId) {
      setError('Anime ID is required');
      setLoading(false);
      return;
    }

    const fetchEpisodes = async () => {
      try {
        const response = await fetch(
          `https://hianime-api-qdks.onrender.com/api/v1/episodes/${animeId}`
        );
        if (!response.ok) throw new Error('Failed to fetch episodes');
        
        const data = await response.json();
        setAnimeData(data.data);
        
        // Find current episode
        const episode = data.data.episodes.find((ep: Episode) => ep.id === episodeId);
        if (!episode) {
          notFound();
          return;
        }
        setCurrentEpisode(episode);
      } catch (err) {
        setError('Failed to load episode data');
        console.error(err);
      }
    };

    fetchEpisodes();
  }, [animeId, episodeId]);

  // Fetch servers when episode is loaded
  useEffect(() => {
    if (!currentEpisode) return;

    const fetchServers = async () => {
      try {
        const response = await fetch(
          `https://hianime-api-qdks.onrender.com/api/v1/servers?id=${episodeId}`
        );
        if (!response.ok) throw new Error('Failed to fetch servers');
        
        const data = await response.json();
        const serverList = isSubbed ? data.data.sub : data.data.dub;
        
        setServers(serverList || []);
        if (serverList && serverList.length > 0) {
          setSelectedServer(serverList[0].name);
        }
      } catch (err) {
        setError('Failed to load servers');
        console.error(err);
      }
    };

    fetchServers();
  }, [currentEpisode, episodeId, isSubbed]);

  // Fetch stream data when server is selected
  useEffect(() => {
    if (!selectedServer || !currentEpisode) return;

    const fetchStream = async () => {
      try {
        const type = isSubbed ? 'sub' : 'dub';
        const response = await fetch(
          `https://hianime-api-qdks.onrender.com/api/v1/stream?id=${episodeId}&server=${selectedServer}&type=${type}`
        );
        if (!response.ok) throw new Error('Failed to fetch stream');
        
        const data = await response.json();
        setStreamData(data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load stream');
        setLoading(false);
        console.error(err);
      }
    };

    fetchStream();
  }, [selectedServer, currentEpisode, episodeId, isSubbed]);

  // Initialize HLS player
  useEffect(() => {
    if (!streamData || !videoRef.current) return;

    const video = videoRef.current;
    const source = streamData.sources.find(s => s.isM3U8);
    
    if (!source) {
      setError('No HLS stream available');
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: false,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      
      hlsRef.current = hls;
      hls.loadSource(source.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest loaded');
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        if (data.fatal) {
          setError('Playback error occurred');
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      video.src = source.url;
    } else {
      setError('HLS not supported in this browser');
    }
  }, [streamData]);

  // Handle intro/outro skip
  useEffect(() => {
    if (!streamData || !videoRef.current) return;

    const video = videoRef.current;
    const { intro, outro } = streamData;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      
      // Show skip intro button
      if (intro && currentTime >= intro.start && currentTime <= intro.end) {
        showSkipButton('intro', intro.end);
      }
      
      // Show skip outro button  
      if (outro && currentTime >= outro.start && currentTime <= outro.end) {
        showSkipButton('outro', outro.end);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [streamData]);

  const showSkipButton = (type: 'intro' | 'outro', skipToTime: number) => {
    // This would show a skip button overlay
    console.log(`Show skip ${type} button, skip to ${skipToTime}`);
  };

  const skipTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleEpisodeChange = (episode: Episode) => {
    const url = `/watch/${episode.id}?anime=${animeId}`;
    window.location.href = url;
  };

  const handleServerChange = (serverName: string) => {
    setSelectedServer(serverName);
    setLoading(true);
  };

  const toggleSubDub = () => {
    setIsSubbed(!isSubbed);
    setLoading(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!animeData || !currentEpisode) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{animeData.info.name}</h1>
          <p className="text-gray-400">
            Episode {currentEpisode.number}: {currentEpisode.title}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              {streamData ? (
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  controls
                  poster={animeData.info.poster}
                  crossOrigin="anonymous"
                >
                  {streamData.tracks.map((track, index) => (
                    <track
                      key={index}
                      kind={track.kind as any}
                      src={track.file}
                      label={track.label}
                      default={track.default}
                    />
                  ))}
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-400">Preparing video...</div>
                </div>
              )}
            </div>

            {/* Server Selection */}
            <div className="mt-4 space-y-4">
              <div className="flex gap-4">
                <button
                  onClick={toggleSubDub}
                  className={`px-4 py-2 rounded ${
                    isSubbed
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  SUB
                </button>
                <button
                  onClick={toggleSubDub}
                  className={`px-4 py-2 rounded ${
                    !isSubbed
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  DUB
                </button>
              </div>

              {servers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Servers</h3>
                  <div className="flex flex-wrap gap-2">
                    {servers.map((server) => (
                      <button
                        key={server.name}
                        onClick={() => handleServerChange(server.name)}
                        className={`px-3 py-1 rounded text-sm ${
                          selectedServer === server.name
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {server.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Episode List */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Episodes</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {animeData.episodes.map((episode) => (
                <button
                  key={episode.id}
                  onClick={() => handleEpisodeChange(episode)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    episode.id === episodeId
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  } ${episode.isFiller ? 'border-l-4 border-yellow-500' : ''}`}
                >
                  <div className="font-medium">Episode {episode.number}</div>
                  <div className="text-sm opacity-75 truncate">
                    {episode.title}
                  </div>
                  {episode.isFiller && (
                    <div className="text-xs text-yellow-400 mt-1">Filler</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
