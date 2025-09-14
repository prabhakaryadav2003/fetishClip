import "./globals.css";
import type { Metadata, Viewport } from "next";
import { getUser, getAllVideos } from "@/lib/db/queries";
import { SWRConfig } from "swr";
import favicon from "@/public/images/favicon.ico";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FetishClip | BDSM, Fetish, and Kink Video Platform",
  description: "Fetish Content Platform for BDSM, Fetish, and Kink Videos",
};

export const viewport: Viewport = {
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${montserrat.className}`}
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
