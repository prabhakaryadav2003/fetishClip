import { getVideoById } from "@/lib/db/queries";
import type { Metadata } from "next";
import { slugify } from "@/lib/utils";

export async function generateVideoMetadata(
  videoId: string
): Promise<Metadata> {
  const video = await getVideoById(videoId);

  if (!video) {
    return {
      title: "Video Not Found",
      description: "The requested video could not be found.",
    };
  }

  const videoSlug = slugify(video.title);
  const videoUrl = `https://example.com/videos/${video.id}/${videoSlug}`;

  return {
    title: video.title,
    description: video.description,
    openGraph: {
      title: video.title,
      description: video.description,
      type: "video.other",
      url: videoUrl,
      siteName: "MyVideoSite",
      images: [
        {
          url: video.thumbnailUrl,
          width: 1280,
          height: 720,
          alt: video.title,
        },
      ],
    },
    twitter: {
      card: "player",
      title: video.title,
      description: video.description,
      images: [video.thumbnailUrl],
    },
  };
}
