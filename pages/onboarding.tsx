import { useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import OnboardingChatInterface from '../components/OnboardingChatInterface';

type PersonaData = {
  name: string;
  age: string;
  occupation: string;
  interests: string[];
  currentProjects: string[];
  workStyle: string;
  preferences: Record<string, string>;
};

function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const [personaData, setPersonaData] = useState<PersonaData | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Handle the completion of onboarding chat
  const handleOnboardingComplete = (data: PersonaData) => {
    setPersonaData(data);
    setIsComplete(true);
    
    // Save the persona data
    savePersonaData(data);
  };

  // Save persona data to the database
  const savePersonaData = async (data: PersonaData) => {
    try {
      const response = await fetch('/api/save-persona', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          personaData: data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save persona data');
      }

      // Mark onboarding as complete
      if (user?.id) {
        localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
      }

      toast({
        title: 'Information saved',
        description: 'Your information has been saved. Let\'s set up your Notion integration.',
      });

      // Redirect to settings page after a short delay
      setTimeout(() => {
        router.push('/settings?setupNotion=true');
      }, 2000);
    } catch (error) {
      console.error('Error saving persona data:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your information. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Welcome to AI Productivity Assistant</h1>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Let's Get to Know You</h2>
          <p className="mb-4">
            To provide you with the best experience, our AI assistant would like to learn about you.
            This information will help us create a personalized PARA framework in Notion for your
            task management.
          </p>
          <p className="text-sm text-gray-500">
            Your information is stored securely and only used to enhance your experience.
          </p>
        </CardContent>
      </Card>

      {!isComplete ? (
        <OnboardingChatInterface onComplete={handleOnboardingComplete} />
      ) : (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Thank You!</h2>
            <p className="mb-4">
              We've collected all the information we need. You'll be redirected to the settings
              page to set up your Notion integration.
            </p>
            <Button
              onClick={() => router.push('/settings?setupNotion=true')}
              className="w-full"
            >
              Continue to Settings
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default OnboardingPage;
