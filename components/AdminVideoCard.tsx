"use client";

import { useRouter } from "next/navigation";
import { VideoData } from "@/types/videoData";
import { slugify } from "@/lib/utils";
import { useState } from "react";
import { Edit2, Eye, Trash2 } from "lucide-react";

interface AdminVideoCardProps {
  video: VideoData;
  onUpdated?: (video: VideoData) => void; // callback to refresh list after update
  onDeleted?: (id: string) => void; // callback after deletion
}

function formatViews(views: number): string {
  if (views >= 1_000_000_000)
    return (views / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (views >= 1_000_000)
    return (views / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (views >= 1_000)
    return (views / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return views.toString();
}

const AdminVideoCard = ({
  video,
  onUpdated,
  onDeleted,
}: AdminVideoCardProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm] = useState({
    title: video.title,
    description: video.description || "",
    tags: video.tags || [],
    isPublic: video.isPublic || "false",
  });
  const [loading, setLoading] = useState(false);

  const handleView = () => {
    router.push(`/videos/${video.id}/${slugify(video.title)}`);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/video/videoid/${video.id}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        // HTTP error
        const error = await res.text();
        throw new Error(error || "Failed to delete video");
      }

      const result = await res.json();

      if (!result.success) {
        // Server responded but deletion failed
        throw new Error(result.message || "Failed to delete video");
      }

      // Only call onDeleted if deletion succeeded
      onDeleted?.(video.id);
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Delete failed", err);
      alert(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const updatedFields: Partial<typeof form> = {};

      Object.keys(form).forEach((key) => {
        const k = key as keyof typeof form;

        if (k === "tags") {
          // Compare arrays by content
          const originalTags = video.tags || [];
          const newTags = form.tags || [];
          const isEqual =
            originalTags.length === newTags.length &&
            originalTags.every((tag, idx) => tag === newTags[idx]);

          if (!isEqual) {
            updatedFields[k] = newTags;
          }
        } else if (form[k] !== (video as any)[k]) {
          updatedFields[k] = form[k];
        }
      });

      // If nothing changed, close modal
      if (Object.keys(updatedFields).length === 0) {
        setIsEditing(false);
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/video/videoid/${video.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedFields),
        }
      );

      const updated = await res.json();
      onUpdated?.(updated.data ?? updated);
      setIsEditing(false);
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Row layout */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 hover:bg-gray-50">
        <div className="flex items-center gap-3">
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/video/${video.thumbnailUrl}`}
            alt={video.title}
            className="w-24 h-14 object-cover rounded"
          />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
              {video.title}
            </h3>
            <p className="text-xs text-gray-500">
              {video.uploaderName} • {formatViews(video.views)} views
            </p>
          </div>
        </div>

        <div className="flex gap-3 text-gray-600">
          <button
            onClick={handleView}
            className="hover:text-red-600 transition-colors duration-20 ease-in-out cursor-pointer"
            title="View Video"
          >
            <Eye size={18} />
          </button>

          <button
            onClick={() => setIsEditing(true)}
            className="hover:text-red-600 transition-colors duration-20 ease-in-out cursor-pointer"
            title="Edit Video"
          >
            <Edit2 size={18} />
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="hover:text-red-600 transition-colors duration-20 ease-in-out cursor-pointer"
            title="Delete Video"
            disabled={loading}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Edit Video</h2>

            <div className="space-y-6">
              {/* Title */}
              <div className="relative">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder=" "
                  className="peer w-full border rounded px-3 pt-3 pb-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <label className="absolute left-3 -top-2 bg-white px-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-500">
                  Title
                </label>
              </div>

              {/* Description */}
              <div className="relative">
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder=" "
                  rows={3}
                  className="peer w-full border rounded px-3 pt-3 pb-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <label className="absolute left-3 -top-2 bg-white px-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-500">
                  Description
                </label>
              </div>

              {/* Tags */}
              <div className="relative">
                <input
                  type="text"
                  value={form.tags.join(", ")}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tags: e.target.value.split(",").map((t) => t.trim()),
                    })
                  }
                  placeholder=" "
                  className="peer w-full border rounded px-3 pt-3 pb-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <label className="absolute left-3 -top-2 bg-white px-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-500">
                  Tags (comma separated)
                </label>
              </div>

              {/* Public / Private Dropdown */}
              <div className="relative">
                <select
                  value={form.isPublic}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      isPublic: e.target.value,
                    })
                  }
                  className="peer w-full appearance-none border rounded px-3 pt-3 pb-2 pr-10 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="true">Public</option>
                  <option value="false">Private</option>
                </select>

                <label className="absolute left-3 -top-2 bg-white px-1 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-500">
                  Visibility
                </label>

                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg
                    className="h-4 w-4 text-gray-500 peer-focus:text-blue-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-100 cursor-pointer"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{video.title}</span>? This action
              cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-100 cursor-pointer"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export { AdminVideoCard };
