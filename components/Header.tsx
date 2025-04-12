'use client';

import { SignInButton, SignOutButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { useState, useCallback } from 'react';
import { useOutsideClick } from '@/hooks/use-outside-click';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const { isSignedIn, user } = useUser();
  const [showMenu, setShowMenu] = useState(false);

  const handleCloseMenu = useCallback(() => {
    setShowMenu(false);
  }, []);

  const menuRef = useOutsideClick(handleCloseMenu);

  return (
    <header className="w-full py-4 px-6 flex justify-between items-center border-b">
      <div className="flex items-center">
        <Link href="/" className="text-xl font-semibold hover:text-slate-700 transition-colors">
          AI Productivity Tool
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {isSignedIn && user ? (
          <div className="relative" ref={menuRef}>
            <div 
              className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded-md px-2 py-1" 
              onClick={() => setShowMenu(!showMenu)}
            >
              <span className="text-sm text-gray-600">
                {user.firstName || user.emailAddresses[0]?.emailAddress}
              </span>
              {user.imageUrl ? (
                <Image 
                  src={user.imageUrl} 
                  alt="Profile" 
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-700">
                  {(user.firstName?.[0] || user.emailAddresses[0]?.emailAddress?.[0] || "?").toUpperCase()}
                </div>
              )}
              <svg 
                className={`h-4 w-4 transition-transform ${showMenu ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-56 py-2 bg-white rounded-md shadow-lg z-20 border border-gray-100">
                <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                  <div className="font-medium">Signed in as</div>
                  <div className="truncate">{user.emailAddresses[0]?.emailAddress}</div>
                </div>
                <div className="py-1">
                  <Link 
                    href="/settings"
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                    onClick={() => setShowMenu(false)}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Link>
                  <SignOutButton>
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </SignOutButton>
                </div>
              </div>
            )}
          </div>
        ) : (
          <SignInButton>
            <Button>Sign in</Button>
          </SignInButton>
        )}
      </div>
    </header>
  );
}