"use client";

import { Dispatch, SetStateAction } from "react";
import { X } from "lucide-react";
import { FileDrop } from "./FileDrop";
import { VideoForm } from "@/types/global";

interface VideoModalProps {
  form: VideoForm;
  setForm: Dispatch<SetStateAction<VideoForm>>;
  formErrors: Partial<Record<keyof VideoForm, string>>;
  handleUpload: () => void;
  resetForm: () => void;
  isEditing: string | null;
  isUploading: boolean;
}

function VideoModal({
  form,
  setForm,
  formErrors,
  handleUpload,
  resetForm,
  isEditing,
  isUploading,
}: VideoModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center"
      onClick={() => {
        if (!isUploading) resetForm();
      }}
    >
      <div
        className="bg-white w-full max-w-lg rounded-lg p-6 shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={resetForm}
          disabled={isUploading}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 disabled:opacity-50"
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
          className="w-full border px-3 py-2 rounded mb-1 disabled:bg-gray-100"
          disabled={isUploading}
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
          className="w-full border px-3 py-2 rounded mb-1 disabled:bg-gray-100"
          disabled={isUploading}
        />
        {formErrors.description && (
          <p className="text-red-500 text-sm pb-1">{formErrors.description}</p>
        )}

        {/* Tags */}
        <input
          type="text"
          placeholder="Tags (Comma Separated)"
          value={form.tagsInput || ""}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, tagsInput: e.target.value }))
          }
          className="w-full border px-3 py-2 rounded mb-1 disabled:bg-gray-100"
          disabled={isUploading}
        />
        {formErrors.tags && (
          <p className="text-red-500 text-sm pb-1">{formErrors.tags}</p>
        )}

        {/* Thumbnail Drop Zone */}
        <FileDrop
          label="Drag & drop thumbnail here or click to select (max 50MB)"
          accept="image/*"
          maxSize={50 * 1024 * 1024}
          file={form.thumbnail}
          preview={form.thumbnailPreview}
          onFileSelect={(file) =>
            setForm((prev) => ({
              ...prev,
              thumbnail: file,
              thumbnailPreview: URL.createObjectURL(file),
            }))
          }
          isImage
        />

        {/* Video Drop Zone */}
        <FileDrop
          label="Drag & drop video here or click to select (max 1GB)"
          accept="video/*"
          maxSize={1024 * 1024 * 1024}
          file={form.videoFile}
          preview={form.videoPreview}
          onFileSelect={(file) =>
            setForm((prev) => ({
              ...prev,
              videoFile: file,
              videoPreview: URL.createObjectURL(file),
            }))
          }
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={resetForm}
            className="text-gray-600 hover:underline disabled:opacity-50"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isUploading && (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
            )}
            {isEditing ? "Update" : isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}

export { VideoModal };
