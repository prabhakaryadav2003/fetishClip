// /app/loading.tsx
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <Loader2 className="animate-spin text-orange-600" size={48} />
      <span className="text-xl text-orange-600 ml-4">Loading...</span>
    </div>
  );
}
