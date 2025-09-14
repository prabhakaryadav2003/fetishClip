import { getVideoById } from "@/lib/db/queries";
import VideoPlayer from "@/components/VideoPlayer";
import VideoMeta from "@/components/VideoMeta";
import { generateVideoSchema } from "./schema";
import { slugify } from "@/lib/utils";

interface VideoPageProps {
  params:
    | { id: string; title: string }
    | Promise<{ id: string; title: string }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;

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
