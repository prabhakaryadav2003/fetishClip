"use server";

import { getActivityLogs } from "@/lib/db/queries";

export default async function getUserActivity() {
  const logs = await getActivityLogs();
  return logs;
}
