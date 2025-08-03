export interface VideoData {
  id: string;
  title: string;
  description: string;
  tags: string[];
  model: { name: string; slug: string };
  thumbnailUrl: string;
  videoUrl: string;
  uploadDate: string;
}

export async function getVideoData(id: string): Promise<VideoData> {
  // Mock
  return {
    id,
    title: "Model Highlights – June",
    description:
      "Watch highlights of Ava Summers in our latest fashion shoot from June. Shot in 4K and styled by top industry professionals.",
    tags: ["model", "fashion", "video", "runway", "summer"],
    model: { name: "Ava Summers", slug: "ava-summers" },
    thumbnailUrl: `https://example.com/api/video/thumbnail?videoId=${id}`,
    videoUrl: `/api/video/playlist?videoId=${id}&type=master`,
    uploadDate: "2025-06-28T10:00:00Z",
  };
}
