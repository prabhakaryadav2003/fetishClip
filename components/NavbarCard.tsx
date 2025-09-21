"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserMenu } from "@/components/User";
import { Dot, Menu, X } from "lucide-react";
import Logo from "@/public/images/logo.png";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/videos", label: "Videos" },
    { href: "/pricing", label: "Pricing" },
  ];

  return (
    <header className="w-full bg-white shadow-sm z-40">
      <nav className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-2 py-2 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center min-w-0">
          <img src={Logo.src} alt="Logo" className="m-3 h-8 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 justify-center items-center space-x-4">
          {navLinks.map((link, i) => (
            <React.Fragment key={link.label}>
              <Link
                href={link.href}
                className="text-lg font-medium text-gray-700 hover:text-gray-900"
              >
                <span className="text-lg font-medium text-gray-700 hover:text-gray-900">
                  {link.label}
                </span>
              </Link>
              {i < navLinks.length - 1 && (
                <Dot className="h-8 w-8 text-red-600" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* UserMenu */}
        <div className="flex items-center space-x-2">
          <Suspense fallback={<div className="h-9" />}>
            <div className="hidden md:block">
              <UserMenu />
            </div>
          </Suspense>
          {/* Hamburger for mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-8 text-zinc-700" />
          </Button>
        </div>
      </nav>

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-0 bg-black opacity-80 z-50 transition-all duration-200 ${mobileOpen ? "block" : "pointer-events-none opacity-0"}`}
        onClick={() => setMobileOpen(false)}
        style={{ display: mobileOpen ? "block" : "none" }}
      />
      <aside
        className={`fixed inset-y-0 right-0 w-72 bg-white z-50 transform ${mobileOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 shadow-xl md:hidden`}
        aria-label="Mobile Navigation"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <Link
              href="/"
              className="flex items-center min-w-0"
              onClick={() => setMobileOpen(false)}
            >
              <img src={Logo.src} alt="Logo" className="h-8 m-2 w-auto" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="size-8" />
            </Button>
          </div>
          <nav className="flex-1 px-4 py-6 flex flex-col space-y-6">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center text-lg font-medium text-gray-700 hover:text-red-400 transition"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="m-auto pb-6 pt-6 border-t">
            <Suspense fallback={null}>
              <UserMenu />
            </Suspense>
          </div>
        </div>
      </aside>
    </header>
  );
}

export { Navbar };
