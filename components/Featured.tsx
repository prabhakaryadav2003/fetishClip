"use client";

import VideoCard from "@/components/VideoCard";
import { VideoData } from "@/types/videoData";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { slugify } from "@/lib/utils";

export default function Featured() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/video/publicvideos`
        );
        const data = await res.json();
        setVideos(data.videos || []);
      } catch (err) {
        console.error("Failed to fetch public videos:", err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <section id="featured" className="w-full pt-14 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-8 text-center">
          Featured Previews
        </h2>

        {loading ? (
          <p className="text-center text-gray-500 pb-10">Loading videos...</p>
        ) : videos.length === 0 ? (
          <p className="text-center text-gray-500 pb-10">
            No videos available.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <Link
                key={video.id}
                href={`/videos/${video.id}/${slugify(video.title)}`}
              >
                <VideoCard video={video} />
              </Link>
            ))}
          </div>
        )}

        {!loading && videos.length > 0 && (
          <div className="flex justify-center my-10">
            <Button
              asChild
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-10"
            >
              <Link href="/videos">See All Videos</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
