import React, { useRef, useState, useEffect } from 'react';

export const VideoPlayer = ({
    src, poster, title, autoPlay = true, muted = true, loop = false, showControls = true, className = "", onPlay, onPause
}) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showPlayButton, setShowPlayButton] = useState(true);
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedData = () => setIsLoaded(true);
        const handlePlay = () => {
            setIsPlaying(true);
            setShowPlayButton(false);
            onPlay?.();
        };
        const handlePause = () => {
            setIsPlaying(false);
            onPause?.();
        };

        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        return () => {
            video.removeEventListener('loadeddata', handleLoadedData);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
        };
    }, [onPlay, onPause]);

    const handlePlayClick = () => {
        const video = videoRef.current;
        if (video) {
            video.play();
        }
    };

    return (
        <div className={`relative rounded-lg overflow-hidden shadow-lg ${className}`}>
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster={poster}
                muted={muted}
                loop={loop}
                playsInline
                preload="metadata"
                controls={showControls && isPlaying}
                aria-label={title}
            >
                <source src={src} type="video/mp4" />
                <p className="text-center text-gray-600 p-4">
                    Your browser does not support the video tag.
                    <a href={src} className="text-indigo-600 hover:text-indigo-700 underline ml-1">
                        Download the video
                    </a>
                </p>
            </video>

            {/* Custom Play Button Overlay */}
            {showPlayButton && !isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30 transition-all duration-300 cursor-pointer group"
                    onClick={handlePlayClick}>
                    <div className="bg-white bg-opacity-90 rounded-full p-4 group-hover:bg-opacity-100 group-hover:scale-110 transition-all duration-300 shadow-lg">
                        <svg className="w-12 h-12 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Loading Indicator */}
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            )}
        </div>
    );
};
