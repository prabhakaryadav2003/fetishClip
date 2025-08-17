"use client";

import { useState, useRef, DragEvent } from "react";
import { Upload, Pencil, Trash2, X } from "lucide-react";
import clsx from "clsx";

interface Video {
  id: string;
  title: string;
  description: string;
  tags: string[];
  thumbnail: string;
}

const initialMockVideos: Video[] = [
  {
    id: "1",
    title: "Travel Vlog - Japan",
    description: "A journey through Kyoto and Tokyo.",
    tags: ["travel", "japan", "vlog"],
    thumbnail: "/images/test-thumb/img1.jpeg",
  },
  {
    id: "2",
    title: "How to Bake a Cake",
    description: "Simple chocolate cake recipe.",
    tags: ["baking", "tutorial"],
    thumbnail: "/images/test-thumb/img2.jpeg",
  },
  {
    id: "3",
    title: "How to Bake a Cake",
    description: "Simple chocolate cake recipe.",
    tags: ["baking", "tutorial"],
    thumbnail: "/images/test-thumb/img2.jpeg",
  },
];

export default function VideoManagementPage() {
  const [videos, setVideos] = useState<Video[]>(initialMockVideos);
  const [form, setForm] = useState<Partial<Video>>({});
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setForm({});
    setIsEditing(null);
    setShowModal(false);
    setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      const file = e.dataTransfer.files[0];
      setForm({ ...form, videoFile: file });
    }
  };

  const handleUpload = () => {
    const { title, description, tags, thumbnail, videoFile } = form;

    if (!title || !description || !tags || !thumbnail || !videoFile) {
      alert("All fields are required");
      return;
    }

    const newVideo: Video = {
      id: isEditing || Date.now().toString(),
      title,
      description,
      tags,
      thumbnail,
      videoFile,
    };

    if (isEditing) {
      setVideos((prev) => prev.map((v) => (v.id === isEditing ? newVideo : v)));
    } else {
      setVideos((prev) => [...prev, newVideo]);
    }

    resetForm();
  };

  const handleEdit = (video: Video) => {
    setForm({ ...video });
    setIsEditing(video.id);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this video?")) {
      setVideos((prev) => prev.filter((v) => v.id !== id));
    }
  };

  return (
    <div className="bg-white p-2 text-black">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-red-600">Video Management</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            <Upload className="w-5 h-5" />
            Upload Video
          </button>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-6 aspect-auto">
          {videos.map((video) => (
            <div key={video.id}>
              <div className="bg-gray-100 rounded-lg overflow-hidden shadow hover:shadow-red-300 hover:scale-103 transition cursor-pointer">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full object-contain aspect-video"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <div className="flex justify-start gap-5">
                    <button
                      onClick={() => handleEdit(video)}
                      className="text-red-600 hover:underline flex items-center gap-1"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="text-gray-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 bg-blend-overlay flex justify-center items-center"
          onClick={resetForm}
        >
          <div
            className="bg-white w-full max-w-lg rounded-lg p-6 shadow-lg relative
             transform transition-all duration-300 ease-out
             scale-95 animate-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-red-600 mb-4">
              {isEditing ? "Edit Video" : "Upload New Video"}
            </h2>

            <input
              type="text"
              placeholder="Title"
              value={form.title || ""}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border px-3 py-2 rounded mb-3"
            />

            <textarea
              placeholder="Description"
              value={form.description || ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full border px-3 py-2 rounded mb-3"
            />

            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={form.tags?.join(", ") || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  tags: e.target.value.split(",").map((t) => t.trim()),
                })
              }
              className="w-full border px-3 py-2 rounded mb-3"
            />

            <input
              type="text"
              placeholder="Thumbnail URL"
              value={form.thumbnail || ""}
              onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
              className="w-full border px-3 py-2 rounded mb-3"
            />

            {/* Drag and Drop */}
            <div
              onClick={() => videoInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={clsx(
                "border-2 border-dashed rounded p-6 text-center cursor-pointer transition mb-3",
                dragActive ? "border-red-500 bg-red-50" : "border-gray-300"
              )}
            >
              {form.videoFile ? (
                <p className="text-green-700 text-sm text-ellipsis overflow-hidden">
                  {form.videoFile.name}
                </p>
              ) : (
                <p className="text-gray-500 text-sm">
                  Drag & drop video file here or click to select
                </p>
              )}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                hidden
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setForm({ ...form, videoFile: e.target.files[0] });
                  }
                }}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={resetForm}
                className="text-gray-600 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                {isEditing ? "Update" : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
