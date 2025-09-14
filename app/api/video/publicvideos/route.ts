import { NextResponse } from "next/server";
import { getPublicVideos } from "@/lib/db/queries";
import { VideoData } from "@/lib/video/videoData";

export async function GET() {
  try {
    const videos: VideoData[] = await getPublicVideos();
    return NextResponse.json({ videos });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
