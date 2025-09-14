"use client";

import { useEffect, useRef } from "react";
import Hls, { Level } from "hls.js";
import "plyr/dist/plyr.css";

interface VideoPlayerProps {
  videoId: string;
}

export default function VideoPlayer({ videoId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const playerRef = useRef<any>(null); // Plyr instance

  useEffect(() => {
    const setupPlayer = async () => {
      const Plyr = (await import("plyr")).default;

      const videoElement = videoRef.current;
      if (!videoElement) return;

      const hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        backBufferLength: 30,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;

      const source = `/api/video/playlist?videoId=${videoId}&type=master`;

      hls.startLevel = -1;
      hls.loadSource(source);
      hls.attachMedia(videoElement);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels = hls.levels;
        const uniqueHeights = Array.from(
          new Set(levels.map((level: Level) => level.height))
        ).sort((a, b) => b - a);

        const plyrOptions = {
          controls: [
            "play-large",
            "play",
            "progress",
            "current-time",
            "mute",
            "volume",
            "settings",
            "pip",
            "airplay",
            "fullscreen",
          ],
          settings: ["quality"],
          quality: {
            default: uniqueHeights[0],
            options: [...uniqueHeights],
            forced: true,
            onChange: (newQuality: number) => {
              if (!hlsRef.current) return;
              if (!videoElement?.isConnected) return;
              videoElement.pause();

              const levelIndex = hlsRef.current.levels.findIndex(
                (level) => level.height === Number(newQuality)
              );
              hlsRef.current.currentLevel = levelIndex;

              const wasPlaying = !videoElement.paused;
              setTimeout(() => {
                if (wasPlaying) {
                  videoElement.play().catch(() => {
                    console.error("Video Playback Failed");
                  });
                }
              }, 300);
            },
          },
        };

        playerRef.current = new Plyr(videoElement, plyrOptions);
      });
    };

    setupPlayer();

    return () => {
      hlsRef.current?.destroy();
      playerRef.current?.destroy();
    };
  }, [videoId]);

  return (
    <div className="max-w-5xl mx-auto my-6 px-4">
      <div className="relative rounded-xl overflow-hidden shadow-lg">
        <video
          ref={videoRef}
          controls
          playsInline
          className="w-full aspect-video rounded-xl"
        />
      </div>
    </div>
  );
}
