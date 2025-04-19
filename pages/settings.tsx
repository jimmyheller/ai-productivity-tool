//pages/settings.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface UserSettings {
  notionToken?: string;
  notionDatabaseId?: string;
}

export default function Settings() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [settings, setSettings] = useState<UserSettings>({});
  const [, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load user settings on page load
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // We'll load settings from localStorage for now
      // In a production app, you'd want to store this server-side
      const savedSettings = localStorage.getItem(`user_settings_${user.id}`);
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (e) {
          console.error('Failed to parse settings', e);
        }
      }
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, user]);

  const saveSettings = async () => {
    if (!isSignedIn || !user) return;
    
    setIsSaving(true);
    try {
      // For now, we'll use localStorage
      // In a production app, you'd want to save this server-side
      localStorage.setItem(`user_settings_${user.id}`, JSON.stringify(settings));
      
      toast({
        title: 'Settings saved',
        description: 'Your Notion API settings have been saved.',
      });
    } catch (error) {
      console.error('Failed to save settings', error);
      toast({
        title: 'Error saving settings',
        description: 'There was a problem saving your settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Update field values
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  // If not signed in, show a message
  if (isLoaded && !isSignedIn) {
    return (
      <>
        <Head>
          <title>Settings - AI Productivity Tool</title>
        </Head>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
          <Header />
          <main className="flex-1 flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Please sign in to access settings</CardDescription>
              </CardHeader>
            </Card>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Settings - AI Productivity Tool</title>
      </Head>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <main className="flex-1 flex flex-col items-center p-4 pt-8">
          <div className="w-full max-w-lg">
            <h1 className="text-2xl font-bold mb-6">User Settings</h1>
            
            <Card>
              <CardHeader>
                <CardTitle>Notion Integration</CardTitle>
                <CardDescription>
                  Configure your Notion API integration to send tasks to your database.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notionToken">Notion API Token</Label>
                  <Input
                    id="notionToken"
                    name="notionToken"
                    type="password"
                    placeholder="secret_abc123..."
                    value={settings.notionToken || ''}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-slate-500">
                    <a 
                      href="https://www.notion.so/my-integrations" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Get your Notion token
                    </a>
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notionDatabaseId">Notion Database ID</Label>
                  <Input
                    id="notionDatabaseId"
                    name="notionDatabaseId"
                    placeholder="abc123def456..."
                    value={settings.notionDatabaseId || ''}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-slate-500">
                    The ID of your Notion database for tasks. You can find this in the URL of your database.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
              </CardFooter>
            </Card>

            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-2">How to set up your Notion integration:</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
                <li>Go to <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Notion integrations</a> and create a new integration</li>
                <li>Give it a name (e.g., &quot;AI Productivity Tool&quot;)</li>
                <li>Copy the &quot;Internal Integration Token&quot; and paste it above</li>
                <li>Create a new database in Notion for your tasks</li>
                <li>In your database, click &quot;Share&quot; and add your integration</li>
                <li>Copy the database ID from the URL and paste it above</li>
              </ol>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}