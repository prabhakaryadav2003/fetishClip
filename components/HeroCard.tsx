import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
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
