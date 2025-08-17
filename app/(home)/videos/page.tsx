"use client";

import { useState, useEffect } from "react";
import VideoCard from "@/components/VideoCard";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";

const mockVideos = new Array(100).fill(null).map((_, i) => ({
  id: `vid${i + 1}`,
  title: `Video Title ${i + 1}`,
  thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
  channel: `Channel ${Math.ceil((i + 1) / 5)}`,
  views: `${(i + 1) * 1000} views`,
}));

const ITEMS_PER_PAGE = 9;

export default function VideosPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filteredVideos, setFilteredVideos] = useState(mockVideos);

  useEffect(() => {
    const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, "");
    const normalizedSearch = normalize(search);

    const results = mockVideos.filter((v) => {
      const title = normalize(v.title);
      const channel = normalize(v.channel);
      return (
        title.includes(normalizedSearch) || channel.includes(normalizedSearch)
      );
    });

    setFilteredVideos(results);
    setPage(1);
  }, [search]);

  const start = (page - 1) * ITEMS_PER_PAGE;
  const currentVideos = filteredVideos.slice(start, start + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredVideos.length / ITEMS_PER_PAGE);

  return (
    <div className="bg-white text-gray-800 px-4 py-7 max-w-7xl mx-auto w-full min-h-dvh">
      <h1 className="text-2xl text-center font-bold mb-4 text-red-600">
        All Videos
      </h1>

      <SearchBar value={search} onChange={setSearch} />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-6 aspect-auto">
        {currentVideos.map((video) => (
          <VideoCard key={video.id} {...video} />
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
