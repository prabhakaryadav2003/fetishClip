"use server";

import { listAllVideosAction } from "@/lib/auth/middleware";

export async function getAllVideos() {
  return await listAllVideosAction();
}
