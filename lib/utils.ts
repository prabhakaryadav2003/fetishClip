import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatViews(views: number): string {
  if (views >= 1_000_000_000)
    return (views / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (views >= 1_000_000)
    return (views / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (views >= 1_000)
    return (views / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return views.toString();
}
