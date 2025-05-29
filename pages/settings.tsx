//pages/settings.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useParaFramework } from '@/hooks/use-para-framework';
import NotionTokenForm from '@/components/NotionTokenForm';
import ParaFrameworkStatus from '@/components/ParaFrameworkStatus';
import ParaFrameworkProgress from '@/components/ParaFrameworkProgress';

export default function Settings() {
  const router = useRouter();
  const { setupNotion } = router.query;
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  // Custom hooks for business logic
  const {
    settings,
    isLoading,
    isSaving,
    updateSetting,
    saveSettings,
    updateParaDatabaseIds,
    resetSettings,
    isSignedIn,
    user,
  } = useUserSettings();

  const {
    isCreating,
    progressStep,
    progressStatus,
    setupParaFramework,
  } = useParaFramework();

  // Handle saving settings and setting up PARA framework
  const handleSave = async () => {
    if (!isSignedIn || !user?.id) {
      toast({
        title: 'Error',
        description: 'You must be signed in to save settings.',
        variant: 'destructive',
      });
      return;
    }

    // Validate token
    if (settings.notionToken && settings.notionToken.length < 50) {
      toast({
        title: 'Invalid token length',
        description: 'Your Notion token appears to be too short',
        variant: 'destructive',
      });
      return;
    }

    try {
      await saveSettings();

      if (settings.notionToken) {
        // Setup PARA framework after saving settings
        await setupParaFramework(settings, user.id, (databaseIds) => {
          updateParaDatabaseIds(databaseIds);
          setIsEditing(false);
          
          // Redirect after onboarding
          if (setupNotion === 'true') {
            setTimeout(() => {
              router.push('/');
            }, 2000);
          }
        });
      } else {
        toast({
          title: 'Settings saved',
          description: 'Your settings have been saved.',
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to save settings', error);
      toast({
        title: 'Error saving settings',
        description: error instanceof Error ? error.message : 'There was a problem saving your settings.',
        variant: 'destructive',
      });
    }
  };

  // Handle cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    resetSettings();
  };

  // Handle starting edit mode
  const handleEdit = () => {
    setIsEditing(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const hasNotionToken = Boolean(settings.notionToken);
  const isInSetupMode = !isEditing && !hasNotionToken;
  const isInEditMode = isEditing || isInSetupMode;

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

            {setupNotion === 'true' && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Set Up Your PARA Framework</CardTitle>
                  <CardDescription>
                    Based on the information you provided, we&apos;ll create a personalized PARA
                    framework in Notion.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 mb-4">
                    PARA stands for Projects, Areas, Resources, and Archive. This framework will
                    help you organize your tasks and information effectively.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li><strong>Projects:</strong> Short-term efforts with a deadline</li>
                    <li><strong>Areas:</strong> Long-term responsibilities you want to maintain</li>
                    <li><strong>Resources:</strong> Topics or themes of ongoing interest</li>
                    <li><strong>Archive:</strong> Inactive items from the other categories</li>
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Notion Integration</CardTitle>
                <CardDescription>
                  {setupNotion === 'true'
                    ? 'Set up your PARA framework in Notion to organize your tasks and information.'
                    : 'Configure your Notion API integration to manage your productivity system.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isCreating ? (
                  <ParaFrameworkProgress 
                    progressStep={progressStep} 
                    progressStatus={progressStatus} 
                  />
                ) : isInEditMode ? (
                  <NotionTokenForm
                    settings={settings}
                    onSettingChange={updateSetting}
                    onSave={handleSave}
                    onCancel={isEditing ? handleCancel : undefined}
                    isSaving={isSaving}
                    isCreating={isCreating}
                    setupNotion={setupNotion === 'true'}
                  />
                ) : (
                  <ParaFrameworkStatus 
                    settings={settings} 
                    onEdit={handleEdit} 
                  />
                )}
              </CardContent>
              <CardFooter>
                {hasNotionToken && !isInEditMode && (
                  <Button
                    onClick={() => router.push('/')}
                    className="w-full"
                  >
                    Return to Dashboard
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}