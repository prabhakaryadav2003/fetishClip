"use client";

import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { VideoModal } from "@/components/VideoModal";
import { VideoForm } from "@/types/global";
import { z } from "zod";
import { getVideosByCreator } from "./actions";
import { VideoData } from "@/types/videoData";
import { AdminVideoCard } from "@/components/AdminVideoCard";

const MAX_THUMBNAIL_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_VIDEO_SIZE = 1024 * 1024 * 1024; // 1GB

// Schema for client-side validation
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
  const [progress, setProgress] = useState(0);

  const router = useRouter();

  // Load videos on mount
  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const response = await getVideosByCreator();

      if (
        response.success &&
        typeof response.data === "object" &&
        "videos" in response.data &&
        Array.isArray(response.data.videos)
      ) {
        setVideos(response.data.videos);
      } else {
        router.push("/pricing");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  };

  // Reset form and modal state
  const resetForm = () => {
    setForm({});
    setFormErrors({});
    setIsEditing(null);
    setShowModal(false);
    setProgress(0);
  };

  // Upload or update video (with progress)
  const handleUpload = () => {
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

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/video/upload");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        if (data?.error) {
          alert(`Upload failed: ${data.error}`);
        } else {
          alert("Uploaded, Wait for some time to process video!");
          resetForm();
          loadVideos();
        }
      } else {
        alert(`Upload failed: ${xhr.responseText}`);
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      alert("Upload failed due to network error");
    };

    setIsUploading(true);
    xhr.send(formData);
  };

  // Handle video update from child component
  const handleUpdated = (
    updatedFields: Partial<VideoData> & { id: string }
  ) => {
    setVideos((prev) =>
      prev.map((v) =>
        v.id === updatedFields.id ? { ...v, ...updatedFields } : v
      )
    );
  };

  // Handle video deletion from child component
  const handleDeleted = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <div className="bg-white text-black p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
            My Video Management
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

        {/* Video List */}
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
            videos.map((video) => (
              <AdminVideoCard
                key={video.id}
                video={video}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            ))
          )}
        </div>
      </div>

      {/* Upload/Edit Modal */}
      {showModal && (
        <VideoModal
          form={form}
          setForm={setForm}
          formErrors={formErrors}
          handleUpload={handleUpload}
          resetForm={resetForm}
          isEditing={isEditing}
          isUploading={isUploading}
          progress={progress}
        />
      )}
    </div>
  );
}
