import { NextResponse } from "next/server";
import { getAllVideos } from "@/lib/db/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "9", 10);
  const search = searchParams.get("search") || undefined;

  try {
    const { videos, total } = await getAllVideos(page, limit, search);
    return NextResponse.json({ videos, total });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
