import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { UserSettings } from './use-user-settings';

export interface ParaFrameworkState {
  isCreating: boolean;
  progressStep: number;
  progressStatus: string;
}

export function useParaFramework() {
  const [state, setState] = useState<ParaFrameworkState>({
    isCreating: false,
    progressStep: 0,
    progressStatus: '',
  });
  const { toast } = useToast();

  const updateProgress = (step: number, status: string) => {
    setState(prev => ({ ...prev, progressStep: step, progressStatus: status }));
  };

  const resetProgress = () => {
    setState({ isCreating: false, progressStep: 0, progressStatus: '' });
  };

  // Check if a PARA framework already exists
  const checkExistingFramework = async (
    notionToken: string,
    notionPageId: string | undefined,
    userId: string
  ) => {
    const response = await fetch('/api/check-para-framework', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notionToken, notionPageId, userId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to check for existing PARA framework: ${response.status} ${errorText}`);
    }

    return response.json();
  };

  // Create a new PARA framework
  const createNewFramework = async (
    notionToken: string,
    notionPageId: string | undefined,
    userId: string
  ) => {
    const response = await fetch('/api/create-para-framework', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notionToken, notionPageId, userId }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create PARA framework';
      try {
        const errorData = await response.json();
        errorMessage = errorData.details || errorMessage;
      } catch (e) {
        const errorText = await response.text();
        errorMessage = `${errorMessage}: ${response.status} ${errorText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  };

  // Main function to check and create PARA framework
  const setupParaFramework = async (
    settings: UserSettings,
    userId: string,
    onSuccess: (databaseIds: any) => void
  ) => {
    if (!settings.notionToken) {
      toast({
        title: 'Missing Notion token',
        description: 'Please provide a Notion API token to check your PARA framework.',
        variant: 'destructive',
      });
      return;
    }

    setState(prev => ({ ...prev, isCreating: true }));
    updateProgress(1, 'Checking for existing PARA framework...');

    try {
      // Check for existing framework
      const checkData = await checkExistingFramework(
        settings.notionToken,
        settings.notionPageId,
        userId
      );
      
      updateProgress(2, 'Analyzing workspace access...');

      if (checkData.exists) {
        updateProgress(4, 'Connected to existing PARA framework!');
        
        onSuccess(checkData.databaseIds);
        
        toast({
          title: 'PARA Framework Found',
          description: 'Your existing PARA framework has been connected successfully!',
        });

        setTimeout(() => {
          resetProgress();
        }, 1500);
      } else {
        // Create new framework
        updateProgress(3, 'Creating PARA framework in Notion...');
        
        const createData = await createNewFramework(
          settings.notionToken,
          settings.notionPageId,
          userId
        );
        
        updateProgress(4, 'PARA framework created successfully!');
        
        onSuccess(createData.databaseIds);
        
        toast({
          title: 'PARA Framework Created',
          description: 'Your PARA framework has been set up in Notion successfully!',
        });

        setTimeout(() => {
          resetProgress();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to setup PARA framework', error);
      setState(prev => ({ ...prev, progressStatus: 'Error setting up PARA framework' }));
      
      toast({
        title: 'Error setting up PARA framework',
        description: error instanceof Error ? error.message : 'There was a problem setting up your PARA framework.',
        variant: 'destructive',
      });

      setTimeout(() => {
        resetProgress();
      }, 1500);
    }
  };

  return {
    ...state,
    setupParaFramework,
    resetProgress,
  };
}