import { getVideoById } from "@/lib/db/queries";
import { VideoPlayer } from "@/components/VideoPlayer";
import { VideoMeta } from "@/components/VideoMeta";
import { generateVideoSchema } from "./schema";
import { slugify } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params?: any;
}): Promise<Metadata> {
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  if (!id) {
    return {
      title: "Video Not Found",
      description: "The requested video could not be found.",
    };
  }

  const video = await getVideoById(id);

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

export default async function VideoPage({ params }: { params?: any }) {
  // normalize params.id
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  if (!id) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-600">
        <h1 className="text-2xl font-bold mb-4">Video Not Found</h1>
        <p>We couldn’t find the video you’re looking for.</p>
      </main>
    );
  }

  const video = await getVideoById(id);

  if (!video) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-600">
        <h1 className="text-2xl font-bold mb-4">Video Not Found</h1>
        <p>We couldn’t find the video you’re looking for.</p>
      </main>
    );
  }

  const schema = generateVideoSchema(video);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">{video.title}</h1>

      <VideoPlayer videoId={slugify(video.title)} />
      <VideoMeta video={video} />

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </main>
  );
}
