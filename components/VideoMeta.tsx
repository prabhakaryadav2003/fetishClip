import Link from "next/link";
import { VideoData } from "@/lib/video/videoData";

export default function VideoMeta({ video }: { video: VideoData }) {
  return (
    <section className="mt-4 text-gray-700">
      <p className="mb-3">{video.description}</p>

      <div className="flex flex-wrap gap-2 mb-2">
        {video.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
          >
            #{tag}
          </span>
        ))}
      </div>

      <p className="text-sm">
        Featuring:{" "}
        <Link
          href={`/models/${video.model.slug}`}
          className="text-blue-600 underline hover:text-blue-800"
        >
          {video.model.name}
        </Link>
      </p>
    </section>
  );
}
