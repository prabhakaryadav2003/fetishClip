"use client";

import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { VideoModal } from "@/components/VideoModal";
import { VideoForm } from "@/types/global";
import { z } from "zod";
import { getVideosByCreator } from "./actions";
import { VideoData } from "@/types/videoData";
import { AdminVideoCard } from "@/components/AdminVideoCard";

const MAX_THUMBNAIL_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_VIDEO_SIZE = 1024 * 1024 * 1024; // 1GB

const videoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  thumbnail: z
    .instanceof(File, { message: "Thumbnail file is required" })
    .refine((file) => file.size <= MAX_THUMBNAIL_SIZE, {
      message: "Thumbnail must be less than 50MB",
    }),
  videoFile: z
    .instanceof(File, { message: "Video file is required" })
    .refine((file) => file.size <= MAX_VIDEO_SIZE, {
      message: "Video must be less than 1GB",
    }),
});

export default function VideoManagementPage() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [form, setForm] = useState<VideoForm>({});
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof VideoForm, string>>
  >({});
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      try {
        const data = await getVideosByCreator();
        setVideos(data);
      } catch (err) {
        console.error("Failed to fetch videos:", err);
      }
      setLoading(false);
    };
    loadVideos();
  }, []);

  const resetForm = () => {
    setForm({});
    setFormErrors({});
    setIsEditing(null);
    setShowModal(false);
  };

  const handleUpload = async () => {
    const tagsArray = (form.tagsInput || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const result = videoSchema.safeParse({
      title: form.title,
      description: form.description,
      tags: tagsArray,
      thumbnail: form.thumbnail,
      videoFile: form.videoFile,
    });

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof VideoForm, string>> = {};
      result.error.errors.forEach((err) => {
        const fieldName = err.path[0] as keyof VideoForm;
        fieldErrors[fieldName] = err.message;
      });
      setFormErrors(fieldErrors);
      return;
    }

    const { title, description, tags, thumbnail, videoFile } = result.data;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("tags", tags.join(","));
    formData.append("thumbnail", thumbnail);
    formData.append("videoFile", videoFile);

    try {
      setIsUploading(true);

      const res = await fetch("/api/video/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data?.error) {
        alert(`Upload failed: ${data.error}`);
        return;
      }

      // Refresh list after successful upload
      const updatedVideos = await getVideosByCreator();
      setVideos(updatedVideos);

      resetForm();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle update
  const handleUpdated = (
    updatedFields: Partial<VideoData> & { id: string }
  ) => {
    setVideos((prev) =>
      prev.map((v) =>
        v.id === updatedFields.id ? { ...v, ...updatedFields } : v
      )
    );
  };

  // Handle delete
  const handleDeleted = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <div className="bg-white text-black p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-lg lg:text-2xl font-medium bold text-gray-900 mb-6">
            Video Management
          </h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            <Upload className="w-5 h-5" /> Upload Video
          </button>
        </div>

        {/* Video Grid */}
        <div className="flex flex-col divide-y divide-gray-200 mt-2">
          {isLoading ? (
            <p className="text-sm text-gray-500 p-4 text-center">
              Loading videos...
            </p>
          ) : videos.length === 0 ? (
            <p className="text-sm text-gray-500 p-4 text-center">
              No videos found.
            </p>
          ) : (
            videos.map((v) => (
              <AdminVideoCard
                key={v.id}
                video={v}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <VideoModal
          form={form}
          setForm={setForm}
          formErrors={formErrors}
          handleUpload={handleUpload}
          resetForm={resetForm}
          isEditing={isEditing}
          isUploading={isUploading}
        />
      )}
    </div>
  );
}
