"use client";

import React from "react";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Finovate: From Literacy to Legacy
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Dashboard
            </Link>
            <Link
              href="/learn"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Learn
            </Link>
            <Link
              href="/invest"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Invest
            </Link>
            <Link
              href="/profile"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Profile
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search placeholder */}
          </div>
          <nav className="flex items-center">
            <button className="inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
              Sign In
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
