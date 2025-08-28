"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AiOutlineUser, AiOutlineLogout } from "react-icons/ai";

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut({ 
        redirect: false,
        callbackUrl: '/auth/logout' 
      });
      // Give a small delay to ensure signOut completes
      setTimeout(() => {
        router.push('/auth/logout');
      }, 100);
    } catch (error) {
      console.error('Sign out error:', error);
      // Force redirect even if signOut fails
      router.push('/auth/logout');
    }
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="hidden font-bold text-xl sm:inline-block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Finovate
          </span>
        </Link>

        {/* Navigation */}
        {session && (
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/learn"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Learn
            </Link>
            <Link
              href="/invest"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Invest
            </Link>
          </nav>
        )}

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {!isClient || status === 'loading' ? (
            <div className="h-10 w-20 animate-pulse bg-gray-200 rounded-md"></div>
          ) : session ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100">
                <AiOutlineUser className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">{session.user.name}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors focus:outline-none"
              >
                <AiOutlineLogout className="mr-2 h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="inline-flex h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
