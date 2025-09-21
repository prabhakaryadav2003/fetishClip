import { VideoData } from "@/types/videoData";

export function generateVideoSchema(video: VideoData) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    contentUrl: `https://example.com${video.videoUrl}`,
    embedUrl: `https://example.com/videos/${video.id}`,
    genre: video.tags,
    actor: {
      "@type": "Person",
      name: video.uploaderName,
    },
    publisher: {
      "@type": "Organization",
      name: "Example Media",
      logo: {
        "@type": "ImageObject",
        url: "https://example.com/logo.png",
      },
    },
  };
}
