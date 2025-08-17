import React from "react";
import Link from "next/link";
import type { SVGProps, ComponentType } from "react";
import Logo from "@/public/images/logo.png";
import Facebook from "@/public/icons/facebook.svg";
import X from "@/public/icons/x.svg";
import Instagram from "@/public/icons/instagram.svg";

// Brand Section
function BrandSection({ logoSrc, brand }: { logoSrc: string; brand: string }) {
  return (
    <div className="flex items-center space-x-3">
      <img src={logoSrc} alt={`${brand} Logo`} className="h-8 w-auto rounded" />
    </div>
  );
}

function Disclaimer() {
  return (
    <div className="text-center">
      <p className="text-sm max-w-xl mx-auto">
        <strong>Notice:</strong> All models are 18+ and content is created
        consensually by professionals. Viewing and use of this site is
        restricted to adults only.
      </p>
    </div>
  );
}

// Navigation Links Section
function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  return (
    <nav className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm">
      {links.map((l) => (
        <Link
          href={l.href}
          key={l.href}
          className="hover:text-gray-100 transition"
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

// Legal Section
function Legal() {
  return (
    <div className="flex flex-col items-center sm:items-end">
      <span className="text-xs text-gray-400">
        &copy; {new Date().getFullYear()} FetishClip.&nbsp;All rights reserved.
      </span>
      <span className="text-xs text-pink-400 font-semibold mt-1">
        18+ Adults Only
      </span>
    </div>
  );
}

export type SocialLink = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  targetBlank?: boolean;
};

export function SocialLinks({
  links = [
    {
      href: "https://twitter.com/fetisheros",
      label: "Twitter/X",
      icon: X,
      targetBlank: true,
    },
    {
      href: "https://instagram.com/fetisheros",
      label: "Instagram",
      icon: Instagram,
      targetBlank: true,
    },
    {
      href: "https://facebook.com/fetisheros",
      label: "Facebook",
      icon: Facebook,
      targetBlank: true,
    },
    // {
    //   href: "mailto:support@fetishclip.com",
    //   label: "Email",
    //   icon: Mail,
    //   targetBlank: true,
    // },
    // {
    //   href: "https://fetisheros.com",
    //   label: "Website",
    //   icon: Globe,
    //   targetBlank: true,
    // },
  ],
  className = "",
}: {
  links?: SocialLink[];
  className?: string;
}) {
  return (
    <div className={`flex space-x-6 ${className}`}>
      {links.map(({ href, label, icon: Icon, targetBlank }) => (
        <Link
          key={href}
          href={href}
          aria-label={label}
          className="hover:text-red-600 transition"
          target={targetBlank ? "_blank" : undefined}
          rel={targetBlank ? "noopener noreferrer" : undefined}
        >
          <Icon className="w-8 h-8 text-white" />
        </Link>
      ))}
    </div>
  );
}

// Main Footer
export default function Footer({
  brand = "FetishClip",
  logoSrc = Logo.src,
  links = [
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
  ],
}: {
  brand?: string;
  logoSrc?: string;
  links?: { href: string; label: string }[];
}) {
  return (
    <footer className="w-full bg-gray-900 text-white py-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto flex flex-col mb-4 md:flex-row items-center justify-between px-6 space-y-6 md:space-y-0">
        <BrandSection logoSrc={logoSrc} brand={brand} />
        <SocialLinks />
      </div>
      <hr className="border-red-600 border-dashed max-w-7xl m-auto hidden md:block" />
      <div className="max-w-7xl mx-auto mt-4 flex flex-col md:flex-row items-center justify-between px-6 space-y-6 md:space-y-0">
        <Legal />
        <Disclaimer />
        <NavLinks links={links} />
      </div>
    </footer>
  );
}
