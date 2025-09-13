import { getAllVideos } from "@/lib/db/queries";

export async function GET() {
  const videos = await getAllVideos();
  console.log();
  return Response.json(videos);
}
