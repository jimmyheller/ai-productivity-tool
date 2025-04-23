// pages/index.tsx
import Head from 'next/head';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import ChatInterface from '@/components/ChatInterface';
import TaskPreview from '@/components/TaskPreview';

// Type definitions
type Task = {
  title: string;
  priority?: string;
  dueDate?: string;
  category?: string;
};

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const [extractedTasks, setExtractedTasks] = useState<Task[]>([]);

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
                  Chat with AI and automatically extract tasks to Notion.
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mx-auto">
                  <div className="lg:col-span-2 w-full">
                    <ChatInterface onExtractedTasks={setExtractedTasks} />
                  </div>
                  <div className="lg:col-span-1 w-full">
                    <TaskPreview tasks={extractedTasks} />
                  </div>
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