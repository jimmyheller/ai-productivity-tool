'use client';

import { SignInButton, SignOutButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { useState, useCallback } from 'react';
import { useOutsideClick } from '@/hooks/use-outside-click';

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
        <h1 className="text-xl font-semibold">AI Productivity Tool</h1>
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
                <img 
                  src={user.imageUrl} 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full object-cover"
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