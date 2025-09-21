import { formatViews } from "@/lib/utils";
import { VideoData } from "@/types/videoData";
import { Eye, User, ExternalLink, Calendar } from "lucide-react";

export default function VideoMeta({ video }: { video: VideoData }) {
  const uploadedDate = new Date(video.uploadDate).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <section className="mt-2 bg-white shadow-md rounded-xl p-6 border border-gray-100">
      {/* Video description */}
      <p className="mb-5 text-gray-800 text-base leading-relaxed">
        {video.description}
      </p>

      {/* Tags */}
      {video.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {video.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium bg-gradient-to-r from-red-100 to-pink-100 text-red-600 px-3 py-1 rounded-full hover:from-red-200 hover:to-pink-200 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-5">
        <div className="flex items-center">
          <Eye className="h-4 w-4 mr-2 text-gray-400" />
          {formatViews(video.views)} views
        </div>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
          {uploadedDate}
        </div>
      </div>

      {/* Uploader info */}
      <div className="space-y-2">
        <p className="flex items-center text-sm">
          <User className="h-4 w-4 mr-2 text-gray-400" />
          Uploaded by{" "}
          <span className="ml-1 font-medium text-blue-600">
            {video.uploaderName}
          </span>
        </p>

        {video.uploaderUrl && (
          <p className="flex items-center text-sm">
            <ExternalLink className="h-4 w-4 mr-2 text-gray-400" />
            <a
              href={
                video.uploaderUrl.startsWith("http")
                  ? video.uploaderUrl
                  : `https://${video.uploaderUrl}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-medium hover:underline"
            >
              Visit model on FetishEros
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
