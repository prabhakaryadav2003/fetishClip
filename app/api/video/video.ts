import { getAllVideos } from "@/lib/db/queries";

export async function GET() {
  const team = await getAllVideos();
  return Response.json(team);
}
