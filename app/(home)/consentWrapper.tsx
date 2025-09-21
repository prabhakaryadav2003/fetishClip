"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Logo from "@/public/images/logo.png";
import { usePathname } from "next/navigation";

function ConsentWrapper({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const [agreed, setAgreed] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("fetish_consent") === "yes") setOpen(false);
    }
  }, [pathname]);

  function handleEnter() {
    setOpen(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("fetish_consent", "yes");
    }
  }

  function handleExit() {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("fetish_consent");
    }
    window.location.href = "https://www.google.com";
  }

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  return (
    <>
      {children}

      {open && (
        <div className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md mx-auto flex flex-col items-center relative">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 text-center flex flex-col items-center">
              <img src={Logo.src} alt="Logo" className="h-8 w-auto mb-2" />
              <p>Age Verification</p>
            </h1>
            <p className="text-gray-700 text-sm mb-6 text-center">
              <strong>18+ ONLY:</strong> This platform contains adult and fetish
              content intended for mature audiences.
              <br />
              <span className="block mt-2">
                By entering, you confirm you are at least 18 years old (or the
                age of majority in your jurisdiction) and consent to viewing
                sexually explicit material. You also agree to our{" "}
                <Link href="/terms" className="text-orange-600 underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-orange-600 underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </p>
            <label className="flex items-center space-x-2 mb-6 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={() => setAgreed(!agreed)}
                className="accent-orange-600 w-5 h-5"
              />
              <span className="text-gray-800 text-sm">
                I am at least 18 and consent to viewing adult content.
              </span>
            </label>
            <Button
              className="w-full bg-red-600 hover:bg-red-700"
              size="lg"
              disabled={!agreed}
              onClick={handleEnter}
            >
              Enter FetishClip
            </Button>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={handleExit}
            >
              Exit Site
            </Button>
            <p className="text-xs text-gray-400 mt-4 text-center">
              If you are underage or find such content offensive, please exit
              the site.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export { ConsentWrapper };
