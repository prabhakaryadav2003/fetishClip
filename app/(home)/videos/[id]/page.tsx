import { getVideoData } from "@/lib/video/videoData";
import { generateVideoSchema } from "./schema";
import { generateVideoMetadata } from "./metaData";
import VideoMeta from "@/components/VideoMeta";
import VideoPlayer from "@/components/VideoPlayer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return generateVideoMetadata((await params).id);
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const video = await getVideoData((await params).id);
  const schema = generateVideoSchema(video);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">{video.title}</h1>

      <VideoPlayer videoId={video.id} />
      <VideoMeta video={video} />

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </main>
  );
}
