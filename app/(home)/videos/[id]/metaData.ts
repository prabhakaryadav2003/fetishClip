import type { Metadata } from "next";
import { getVideoData } from "@/lib/video/videoData";

export async function generateVideoMetadata(id: string): Promise<Metadata> {
  const video = await getVideoData(id);

  return {
    title: video.title,
    description: video.description,
    openGraph: {
      title: video.title,
      description: video.description,
      type: "video.other",
      url: `https://example.com/video/${video.id}`,
      images: [{ url: video.thumbnailUrl }],
    },
    twitter: {
      card: "player",
      title: video.title,
      description: video.description,
      images: [video.thumbnailUrl],
    },
  };
}
