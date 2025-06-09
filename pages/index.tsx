// pages/index.tsx
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import ChatInterface from '@/components/ChatInterface';

// Type definitions
type ParaElement = {
  id: string;
  title: string;
  description?: string;
  type: 'project' | 'area' | 'resource' | 'archive';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags?: string[];
  context?: string;
  confirmed?: boolean;
};

type ParaData = {
  projects: ParaElement[];
  areas: ParaElement[];
  resources: ParaElement[];
  archives: ParaElement[];
};

export default function Home() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [, setParaData] = useState<ParaData>({
    projects: [],
    areas: [],
    resources: [],
    archives: [],
  });
  const router = useRouter();

  // Check if user needs onboarding
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Check if the user has completed onboarding
      const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${user.id}`);
      
      if (!hasCompletedOnboarding) {
        // Redirect to onboarding page
        router.push('/onboarding');
      }
    }
  }, [isLoaded, isSignedIn, user, router]);

  // Wait for authentication to load
  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>AI Productivity Assistant</title>
        <meta name="description" content="Chat with AI and organize tasks automatically" />
      </Head>

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />

        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-5xl mx-auto space-y-6">
            {isSignedIn ? (
              <>
                <h1 className="text-4xl font-bold text-center text-slate-800">
                  AI Productivity Assistant
                </h1>
                <p className="text-center text-slate-600 mb-8">
                  Chat with AI and automatically extract PARA elements to organize your productivity.
                </p>
                
                <div className="w-full">
                  <ChatInterface onExtractedPara={setParaData} />
                </div>
              </>
            ) : (
              <Card className="p-6">
                <CardContent className="flex flex-col items-center space-y-4 pt-4">
                  <h1 className="text-3xl font-bold text-center">Welcome to AI Productivity Assistant</h1>
                  <p className="text-center text-slate-600 max-w-md">
                    Sign in to chat with AI, extract tasks, and boost productivity with automatic organization.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}