"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { VideoCard } from "@/components/VideoCard";
import { Pagination } from "@/components/Pagination";
import { SearchBar } from "@/components/SearchBar";
import type { VideoData } from "@/types/videoData";

const ITEMS_PER_PAGE = 9;

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [searchInput, setSearchInput] = useState(""); // What user types
  const [search, setSearch] = useState(""); // What is actually searched
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch videos based on search & page
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `/api/video/allvideos?page=${page}&limit=${ITEMS_PER_PAGE}&search=${encodeURIComponent(search)}`
        );

        if (!res.ok) throw new Error("Failed to fetch videos");

        const data = await res.json();
        const fetchedVideos = Array.isArray(data.videos) ? data.videos : [];

        setVideos(fetchedVideos);
        setTotalPages(
          Math.max(1, Math.ceil((data.total || 0) / ITEMS_PER_PAGE))
        );
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error loading videos");
        setVideos([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [search, page]);

  // Reset to page 1 when new search is triggered
  const handleSearch = () => {
    if (searchInput.trim() !== search) {
      setSearch(searchInput.trim());
      setPage(1);
    }
  };

  return (
    <div className="bg-white text-gray-800 px-4 py-7 max-w-7xl mx-auto w-full min-h-dvh">
      <h1 className="text-2xl text-center font-bold mb-4 text-red-600">
        All Videos
      </h1>

      {/* Search bar and button */}
      <div className="flex items-center gap-2">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onEnter={handleSearch}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition cursor-pointer"
        >
          Search
        </button>
      </div>

      {/* Content display */}
      <div className="mt-6">
        {loading ? (
          <p className="text-center">Loading videos...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : videos.length === 0 ? (
          <p className="text-center">No videos found</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
