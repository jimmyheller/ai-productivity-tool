import Head from 'next/head';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import InputForm from '@/components/InputForm';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const [, setStructuredData] = useState(null);

  // Wait for authentication to load
  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>AI Productivity Tool</title>
        <meta name="description" content="Organize your thoughts with AI" />
      </Head>

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />

        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-2xl space-y-6">
            {isSignedIn ? (
              <>
                <h1 className="text-4xl font-bold text-center text-slate-800">
                  AI Productivity Tool
                </h1>
                <p className="text-center text-slate-600">
                  Dump your thoughts and let AI organize them for you.
                </p>
                <InputForm onStructuredData={setStructuredData} />
              </>
            ) : (
              <Card className="p-6">
                <CardContent className="flex flex-col items-center space-y-4 pt-4">
                  <h1 className="text-3xl font-bold text-center">Welcome to AI Productivity Tool</h1>
                  <p className="text-center text-slate-600 max-w-md">
                    Sign in to organize your thoughts, create tasks, and boost productivity with the help of AI.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </>
  );
}