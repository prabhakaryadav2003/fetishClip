"use client";
import { useEffect } from "react";

export default function OverflowReset() {
  useEffect(() => {
    document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return null;
}
