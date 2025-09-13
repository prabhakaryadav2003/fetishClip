"use client";

import { useEffect, useState } from "react";
import { Trash2, Globe } from "lucide-react";
import { VideoStored } from "@/types/global";

export default function VideoManagementPage() {
  const [videos, setVideos] = useState<VideoStored[]>([]);
  const [loading, setLoading] = useState(true);

  //Fetch videos from API
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("/api/videos");
        const data = await res.json();
        setVideos(data);
      } catch (err) {
        console.error("Failed to fetch videos", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  //Delete video
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      await fetch(`/api/videos/${id}`, {
        method: "DELETE",
      });
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  //Make video public
  const handleMakePublic = async (id: string) => {
    try {
      await fetch(`/api/videos/${id}/publish`, {
        method: "PATCH",
      });
      setVideos((prev) =>
        prev.map((v) => (v.id === id ? { ...v, isPublic: true } : v))
      );
    } catch (err) {
      console.error("Make public failed", err);
    }
  };

  if (loading) return <p className="p-4">Loading videos...</p>;

  return (
    <div className="bg-white p-4 text-black">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-red-600 mb-6">
          Video Management
        </h1>

        {/* Video List */}
        <div className="space-y-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex items-start gap-4 bg-gray-50 border rounded-lg p-4 shadow hover:shadow-red-200 transition"
            >
              {/* Thumbnail */}
              <img
                src={
                  typeof video.thumbnail === "string"
                    ? video.thumbnail
                    : (video.thumbnail as any).src
                }
                alt={video.title}
                className="w-32 h-20 object-cover rounded"
              />

              {/* Info */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{video.title}</h3>
                <p className="text-sm text-gray-600">{video.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Tags: {video.tags.join(", ")}
                </p>

                {/* Actions */}
                <div className="flex gap-4 mt-2 text-sm">
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="flex items-center gap-1 text-gray-600 hover:underline"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                  {!video.isPublic && (
                    <button
                      onClick={() => handleMakePublic(video.id)}
                      className="flex items-center gap-1 text-green-600 hover:underline"
                    >
                      <Globe size={16} /> Make Public
                    </button>
                  )}
                  {video.isPublic && (
                    <span className="text-green-700 text-sm font-semibold">
                      ✅ Public
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {videos.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              No videos available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
