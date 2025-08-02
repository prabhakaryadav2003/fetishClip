import ConsentWrapper from "./consentWrapper";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlayCircle, Lock } from "lucide-react";

const featuredVideos = [
  {
    id: "vid1",
    title: "Latex Fantasy Session",
    thumb: "/images/test-thumb/img1.jpeg",
    duration: "12:34",
    premium: false,
  },
  {
    id: "vid2",
    title: "Dom/Sub Teaser",
    thumb: "/images/test-thumb/img2.jpg",
    duration: "6:43",
    premium: true,
  },
  {
    id: "vid3",
    title: "Boot Worship Highlights",
    thumb: "/images/test-thumb/img3.jpeg",
    duration: "10:12",
    premium: false,
  },
  {
    id: "vid4",
    title: "Rope Bondage Introduction",
    thumb: "/images/test-thumb/img4.jpg",
    duration: "8:05",
    premium: true,
  },
];

function Hero() {
  return (
    <section className="w-full py-8 px-4 bg-gray-800 text-white flex flex-col items-center sm:py-16">
      <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-center mb-4">
        <span className="text-red-600">Premium Fetish Platform</span>
      </h1>
      <p className="text-lg text-gray-300 max-w-2xl text-center mb-8">
        Watch exclusive fetish, BDSM, and kink videos from verified creators.
        <br />
        <span className="text-red-400 font-semibold">18+ ONLY</span> • Discreet,
        safe, and community-powered.
      </p>
      <div className="flex gap-4">
        <Button
          asChild
          size="lg"
          className="bg-red-600 hover:bg-red-700 text-white px-10"
        >
          <Link href="/sign-up">Join Now</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="text-red-600 border-red-600 hover:bg-red-700 hover:text-white transition-colors"
        >
          <Link href="#featured">Browse Videos</Link>
        </Button>
      </div>
    </section>
  );
}

function Featured() {
  return (
    <section id="featured" className="w-full pt-14 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-8 text-center">
          Featured Previews
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {featuredVideos.map((video) => (
            <div
              key={video.id}
              className="relative group bg-white rounded-xl shadow-md overflow-hidden hover:scale-105 transition"
            >
              <img
                src={video.thumb}
                alt={video.title}
                className="w-full h-48 object-cover"
              />
              {video.premium && (
                <span className="absolute top-2 right-2 bg-red-600 text-xs px-3 py-1 rounded-full flex items-center">
                  <Lock className="h-3 w-3 mr-1" /> Premium
                </span>
              )}
              <span className="absolute left-4 bottom-3 bg-gray-500 bg-opacity-70 text-white text-xs px-2 py-0.5 rounded-full">
                {video.duration}
              </span>
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-white font-medium truncate">
                  {video.title}
                </span>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-red-500 px-2 hover:bg-red-500 hover:text-white"
                >
                  <Link
                    href={video.premium ? "/pricing" : `/videos/${video.id}`}
                  >
                    <PlayCircle className="h-6 w-6" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <Button
            asChild
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white px-10"
          >
            <Link href="/videos">See All Videos</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <ConsentWrapper>
      <Hero />
      <Featured />
    </ConsentWrapper>
  );
}
