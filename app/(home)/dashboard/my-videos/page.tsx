"use client";

import { useState, useRef, DragEvent } from "react";
import { Upload, Pencil, Trash2, X } from "lucide-react";
import clsx from "clsx";
import { uploadVideo } from "./actions";
import { z } from "zod";

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

interface Video {
  id: string;
  title: string;
  description: string;
  tagsInput: string;
  tags: string[];
  thumbnail: File;
  videoFile: File;
}

type VideoForm = Partial<Video> & {
  thumbnailPreview?: string;
  videoPreview?: string;
};

export default function VideoManagementPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [form, setForm] = useState<VideoForm>({});
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof VideoForm, string>>
  >({});
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<{
    type: "video" | "thumb" | null;
  }>({ type: null });

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setForm({});
    setFormErrors({});
    setIsEditing(null);
    setShowModal(false);
    setDragActive({ type: null });
  };

  const validateFile = (file: File, maxSize: number, label: string) => {
    if (file.size > maxSize) {
      alert(`${label} must be less than ${maxSize / (1024 * 1024)}MB.`);
      return false;
    }
    return true;
  };

  const handleDrop = (
    e: DragEvent<HTMLDivElement>,
    type: "video" | "thumb"
  ) => {
    e.preventDefault();
    setDragActive({ type: null });
    if (!e.dataTransfer.files?.length) return;

    const file = e.dataTransfer.files[0];
    if (type === "video" && !validateFile(file, MAX_VIDEO_SIZE, "Video"))
      return;
    if (
      type === "thumb" &&
      !validateFile(file, MAX_THUMBNAIL_SIZE, "Thumbnail")
    )
      return;

    setForm((prev) => ({
      ...prev,
      [type === "video" ? "videoFile" : "thumbnail"]: file,
      [type === "video" ? "videoPreview" : "thumbnailPreview"]:
        URL.createObjectURL(file),
    }));
  };

  const handleUpload = async () => {
    const tagsArray = (form.tagsInput || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    form.tags = tagsArray;
    const result = videoSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof VideoForm, string>> = {};
      result.error.errors.forEach((err) => {
        const fieldName = err.path[0] as keyof VideoForm;
        fieldErrors[fieldName] = err.message;
      });
      setFormErrors(fieldErrors);
      return;
    }

    setFormErrors({});
    const { title, description, tags, thumbnail, videoFile } = result.data;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("tags", (tags || []).join(","));
    formData.append("thumbnail", thumbnail);
    formData.append("videoFile", videoFile);

    await uploadVideo(formData);

    const newVideo: Video = {
      id: isEditing || Date.now().toString(),
      title,
      description,
      tagsInput: "",
      tags,
      thumbnail,
      videoFile,
    };

    setVideos((prev) =>
      isEditing
        ? prev.map((v) => (v.id === isEditing ? newVideo : v))
        : [...prev, newVideo]
    );

    resetForm();
  };

  const handleEdit = (video: Video) => {
    setForm({
      ...video,
      thumbnailPreview: URL.createObjectURL(video.thumbnail),
      videoPreview: URL.createObjectURL(video.videoFile),
    });
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
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-red-600">Video Management</h1>
          <button
            onClick={() => {
              setForm({});
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            <Upload className="w-5 h-5" />
            Upload Video
          </button>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-6">
          {videos.map((video) => (
            <div key={video.id}>
              <div className="bg-gray-100 rounded-lg overflow-hidden shadow hover:shadow-red-300 hover:scale-103 transition cursor-pointer">
                <img
                  src={URL.createObjectURL(video.thumbnail)}
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
                      <Pencil size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="text-gray-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={16} /> Delete
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
          className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center"
          onClick={resetForm}
        >
          <div
            className="bg-white w-full max-w-lg rounded-lg p-6 shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-red-600 mb-4">
              {isEditing ? "Edit Video" : "Upload New Video"}
            </h2>

            {/* Title */}
            <input
              type="text"
              placeholder="Title"
              value={form.title || ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full border px-3 py-2 rounded mb-1"
            />
            {formErrors.title && (
              <p className="text-red-500 text-sm pb-1">{formErrors.title}</p>
            )}

            {/* Description */}
            <textarea
              placeholder="Description"
              value={form.description || ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full border px-3 py-2 rounded mb-1"
            />
            {formErrors.description && (
              <p className="text-red-500 text-sm pb-1">
                {formErrors.description}
              </p>
            )}

            {/* Tags */}
            <input
              type="text"
              id="tags"
              placeholder="Tags (Comma Seperated)"
              value={form.tagsInput || ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  tagsInput: e.target.value,
                }))
              }
              className="w-full border px-3 py-2 rounded mb-1"
            />
            {formErrors.tags && (
              <p className="text-red-500 text-sm pb-1">{formErrors.tags}</p>
            )}

            {/* Thumbnail Drop Zone */}
            <div
              onClick={() => thumbInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive({ type: "thumb" });
              }}
              onDragLeave={() => setDragActive({ type: null })}
              onDrop={(e) => handleDrop(e, "thumb")}
              className={clsx(
                "border-2 border-dashed rounded p-6 text-center cursor-pointer transition mb-1",
                dragActive.type === "thumb"
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              )}
            >
              {form.thumbnailPreview ? (
                <img
                  src={form.thumbnailPreview}
                  alt="Thumbnail preview"
                  className="max-h-40 mx-auto mb-2"
                />
              ) : (
                <p className="text-gray-500 text-sm">
                  Drag & drop thumbnail here or click to select (max 50MB)
                </p>
              )}
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (
                    file &&
                    validateFile(file, MAX_THUMBNAIL_SIZE, "Thumbnail")
                  ) {
                    setForm((prev) => ({
                      ...prev,
                      thumbnail: file,
                      thumbnailPreview: URL.createObjectURL(file),
                    }));
                  }
                }}
              />
            </div>
            {formErrors.thumbnail && (
              <p className="text-red-500 text-sm pb-1">
                {formErrors.thumbnail}
              </p>
            )}

            {/* Video Drop Zone */}
            <div
              onClick={() => videoInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive({ type: "video" });
              }}
              onDragLeave={() => setDragActive({ type: null })}
              onDrop={(e) => handleDrop(e, "video")}
              className={clsx(
                "border-2 border-dashed rounded p-6 text-center cursor-pointer transition mb-1",
                dragActive.type === "video"
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              )}
            >
              {form.videoFile ? (
                <p className="text-green-700 text-sm truncate">
                  {form.videoFile.name}
                </p>
              ) : (
                <p className="text-gray-500 text-sm">
                  Drag & drop video here or click to select (max 1GB)
                </p>
              )}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && validateFile(file, MAX_VIDEO_SIZE, "Video")) {
                    setForm((prev) => ({
                      ...prev,
                      videoFile: file,
                      videoPreview: URL.createObjectURL(file),
                    }));
                  }
                }}
              />
            </div>
            {formErrors.videoFile && (
              <p className="text-red-500 text-sm pb-1">
                {formErrors.videoFile}
              </p>
            )}

            {/* Actions */}
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
