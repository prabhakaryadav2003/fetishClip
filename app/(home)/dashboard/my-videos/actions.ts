"use server";

import { listMyVideosAction } from "@/lib/auth/middleware";

export async function getVideosByCreator() {
  return await listMyVideosAction();
}
