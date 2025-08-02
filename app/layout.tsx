import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { getUser, getAllVideos } from "@/lib/db/queries";
import { SWRConfig } from "swr";
import favicon from "@/public/images/favicon.ico";

export const metadata: Metadata = {
  title: "FetishClip | BDSM, Fetish, and Kink Video Platform",
  description: "Fetish Content Platform for BDSM, Fetish, and Kink Videos",
};

export const viewport: Viewport = {
  maximumScale: 1,
};

const manrope = Manrope({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={favicon.src} />
      </head>
      <body className="min-h-[100dvh] bg-gray-50">
        <SWRConfig
          value={{
            fallback: {
              // We do NOT await here
              // Only components that read this data will suspend
              "/api/user": getUser(),
              "/api/video": getAllVideos(),
            },
          }}
        >
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
