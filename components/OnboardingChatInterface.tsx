'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type PersonaData = {
  name: string;
  age: string;
  occupation: string;
  interests: string[];
  currentProjects: string[];
  workStyle: string;
  preferences: Record<string, string>;
};

interface Props {
  onComplete: (data: PersonaData) => void;
}

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function OnboardingChatInterface({ onComplete }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi there! I'm your AI productivity assistant. I'd like to get to know you better so I can help set up your personalized PARA framework in Notion. Could you start by telling me your name?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Questions to ask during onboarding
  const onboardingSteps = [
    { question: 'Could you tell me your name?', field: 'name' },
    { question: 'Nice to meet you! If you don\'t mind sharing, what\'s your age?', field: 'age' },
    { question: 'What do you do for work?', field: 'occupation' },
    { question: 'What are some of your interests or hobbies?', field: 'interests' },
    { question: 'Are you currently working on any projects? If so, could you briefly describe them?', field: 'currentProjects' },
    { question: 'How would you describe your work style? (e.g., detail-oriented, big-picture thinker, deadline-driven)', field: 'workStyle' },
    { question: 'Do you have any specific preferences for how you like to organize your tasks?', field: 'preferences' },
    { question: 'Is there anything else you\'d like me to know to help personalize your experience?', field: 'additionalInfo' }
  ];

  // Collected data
  const [personaData, setPersonaData] = useState<Partial<PersonaData>>({});

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage = { role: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Process the user's response for the current step
      processUserResponse(userMessage.content, onboardingSteps[currentStep].field);

      // Move to the next step
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      // If we've reached the end of the steps, complete the onboarding
      if (nextStep >= onboardingSteps.length) {
        // Add final message
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: 'Thank you for sharing all this information! I now have a good understanding of your needs and preferences. I\'ll use this to set up your personalized PARA framework in Notion.'
          }
        ]);

        // Complete the onboarding process after a short delay
        setTimeout(() => {
          onComplete(personaData as PersonaData);
        }, 2000);
      } else {
        // Add the next question
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: onboardingSteps[nextStep].question
          }
        ]);
      }
    } catch (error) {
      console.error('Error processing response:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processUserResponse = (response: string, field: string) => {
    // Process and store the user's response based on the field
    let processedValue: any = response;

    // For fields that should be arrays, split the response
    if (field === 'interests' || field === 'currentProjects') {
      processedValue = response
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }

    // For preferences, we'll just store the raw text for now
    // In a real app, you might want to parse this more intelligently

    // Update the persona data
    setPersonaData(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  return (
    <Card className="p-4 flex flex-col h-[600px] w-full">
      <CardContent className="flex flex-col space-y-4 h-full p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-blue-100 ml-auto text-blue-900' 
                  : 'bg-gray-100 mr-auto text-gray-900'
              }`}
            >
              {message.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <form 
          onSubmit={handleSubmit}
          className="border-t pt-4 flex flex-col space-y-2"
        >
          <Textarea
            placeholder="Type your response here..."
            value={input}
            onChange={handleInputChange}
            rows={2}
            className="min-h-[80px]"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="btn-primary"
          >
            {isLoading ? 'Processing...' : 'Send'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
