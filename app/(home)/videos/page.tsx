"use client";

import { useState, useEffect } from "react";
import VideoCard from "@/components/VideoCard";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import { VideoData } from "@/lib/video/videoData";

const ITEMS_PER_PAGE = 9;

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState(""); // input box state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch paginated videos from API
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await fetch(
          `/api/video/allvideos?page=${page}&limit=${ITEMS_PER_PAGE}&search=${encodeURIComponent(
            search
          )}`
        );
        if (!res.ok) throw new Error("Failed to fetch videos");
        const data = await res.json();

        setVideos(Array.isArray(data.videos) ? data.videos : []);
        setTotalPages(
          Math.max(1, Math.ceil((data.total || 0) / ITEMS_PER_PAGE))
        );
      } catch (err) {
        console.error(err);
        setError(true);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [page, search]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  // Trigger search on button click or Enter
  const handleSearch = () => {
    setSearch(searchInput.trim());
  };

  return (
    <div className="bg-white text-gray-800 px-4 py-7 max-w-7xl mx-auto w-full min-h-dvh">
      <h1 className="text-2xl text-center font-bold mb-4 text-red-600">
        All Videos
      </h1>

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

      {loading ? (
        <p className="text-center mt-6">Loading videos...</p>
      ) : error ? (
        <p className="text-center mt-6 text-red-600">Error loading videos</p>
      ) : videos.length === 0 ? (
        <p className="text-center mt-6">No videos found</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-6">
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
  );
}
