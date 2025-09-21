import { NextRequest, NextResponse } from "next/server";
import { deleteVideo, getVideoById, updateVideo } from "@/lib/db/queries";

// Utility for consistent error responses
function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// GET video
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await ctx.params;
  const { id } = resolvedParams;

  if (!id) return errorResponse("Video ID is required", 400);

  try {
    const video = await getVideoById(id);
    if (!video) return errorResponse("Video not found", 404);

    return NextResponse.json({ success: true, data: video }, { status: 200 });
  } catch (err) {
    console.error("Error fetching video:", err);
    return errorResponse("Internal server error");
  }
}

// PATCH video
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await ctx.params;
  const { id } = resolvedParams;

  if (!id) return errorResponse("Video ID is required", 400);

  try {
    const body = await req.json();
    if (!body || typeof body !== "object")
      return errorResponse("Invalid request body", 400);

    if (
      body.title === undefined &&
      body.description === undefined &&
      body.isPublic === undefined &&
      body.tags === undefined
    ) {
      return errorResponse("No fields provided to update", 400);
    }

    const isPublic =
      body.isPublic === true || body.isPublic === "true" || body.isPublic === 1;

    const updated = await updateVideo(id, {
      title: body.title,
      description: body.description,
      isPublic,
      tags: Array.isArray(body.tags) ? body.tags : undefined,
    });

    return NextResponse.json(
      { success: true, message: "Video updated successfully", data: updated },
      { status: 200 }
    );
  } catch (err) {
    console.error("Update failed:", err);
    return errorResponse("Failed to update video");
  }
}

// DELETE video
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await ctx.params;
  const { id } = resolvedParams;

  if (!id) return errorResponse("Video ID is required", 400);

  try {
    await deleteVideo(id);
    return NextResponse.json(
      { success: true, message: "Video deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Delete failed:", err);
    return errorResponse("Failed to delete video");
  }
}
