"use client";

import { useRouter } from "next/navigation";
import { VideoData } from "@/lib/video/videoData";
import { slugify } from "@/lib/utils";

interface VideoCardProps {
  video: VideoData;
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

const VideoCard = ({ video }: VideoCardProps) => {
  const router = useRouter();

  return (
    <div
      className="bg-gray-100 rounded-lg overflow-hidden shadow hover:shadow-red-300 hover:scale-103 transition cursor-pointer"
      onClick={() => router.push(`/videos/${video.id}/${slugify(video.title)}`)} // video detail page
    >
      <img
        src={`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/video/${video.thumbnailUrl}`}
        alt={video.title}
        loading="lazy"
        className="w-full object-contain aspect-video"
      />
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
          {video.title}
        </h3>
        <div className="flex justify-between">
          <span className="text-xs text-gray-600">{video.uploaderName}</span>
          <span className="text-xs text-gray-500">
            {formatViews(video.views)} views
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
