import ConsentWrapper from "./consentWrapper";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import VideoCard from "@/components/VideoCard";

const featuredVideos = [
  {
    id: "vid1",
    title: "Intro to Latex Styling",
    thumbnail: "/images/test-thumb/img1.jpeg",
    channel: "Sensual Styles",
    views: "102K views",
  },
  {
    id: "vid2",
    title: "Exploring Power Dynamics",
    thumbnail: "/images/test-thumb/img2.jpg",
    channel: "Bound & Balanced",
    views: "87K views",
  },
  {
    id: "vid3",
    title: "Footwear & Devotion",
    thumbnail: "/images/test-thumb/img3.jpeg",
    channel: "Fetish Diaries",
    views: "63K views",
  },
  {
    id: "vid4",
    title: "Rope Play: Beginner’s Guide",
    thumbnail: "/images/test-thumb/img4.jpg",
    channel: "Knots & Connection",
    views: "115K views",
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

export function Featured() {
  return (
    <section id="featured" className="w-full pt-14 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-8 text-center">
          Featured Previews
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredVideos.map((video) => (
            <Link key={video.id} href={`/videos/${video.id}`}>
              <VideoCard
                id={video.id}
                title={video.title}
                thumbnail={video.thumbnail}
                channel={video.channel}
                views={video.views}
                url="this-is-test2"
              />
            </Link>
          ))}
        </div>

        <div className="flex justify-center my-10">
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
