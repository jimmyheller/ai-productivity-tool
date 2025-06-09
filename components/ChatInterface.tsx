// components/ChatInterface.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useChat } from 'ai/react';
import { useUser } from '@clerk/nextjs';
import ParaSidebar from './ParaSidebar';


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

interface Props {
  onExtractedPara?: (para: ParaData) => void;
}

export default function ChatInterface({ onExtractedPara }: Props) {
  const { user } = useUser();
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    onFinish: async () => {
      // Trigger PARA extraction after each message completes
      setTimeout(() => {
        extractParaFromConversation();
      }, 500); // Small delay to ensure message is added to state
    },
  });
  
  const [isRecording, setIsRecording] = useState(false);
  const [isExtractingPara, setIsExtractingPara] = useState(false);
  const [paraData, setParaData] = useState<ParaData>({
    projects: [],
    areas: [],
    resources: [],
    archives: [],
  });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Extract PARA elements from the current conversation
  const extractParaFromConversation = useCallback(async () => {
    if (messages.length < 2) {
      return;
    }

    setIsExtractingPara(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: messages,
          extractPara: true
        }),
      });

      if (!res.ok) throw new Error('Failed to extract PARA elements');

      const data = await res.json();
      
      if (data.para) {
        // Mark new elements as unconfirmed
        const newParaData = {
          projects: data.para.projects.map((p: ParaElement) => ({ ...p, confirmed: false })),
          areas: data.para.areas.map((a: ParaElement) => ({ ...a, confirmed: false })),
          resources: data.para.resources.map((r: ParaElement) => ({ ...r, confirmed: false })),
          archives: data.para.archives.map((a: ParaElement) => ({ ...a, confirmed: false })),
        };
        
        setParaData(newParaData);
        onExtractedPara?.(newParaData);
      }
    } catch (error: unknown) {
      console.error('[PARA Extraction Error]', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({ title: 'PARA extraction failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsExtractingPara(false);
    }
  }, [messages, onExtractedPara, toast]);

  // Auto-extract PARA elements when messages update and AI is not loading
  useEffect(() => {
    if (!isLoading && messages.length >= 2) {
      const lastMessage = messages[messages.length - 1];
      // Only extract if the last message is from the assistant
      if (lastMessage?.role === 'assistant') {
        setTimeout(() => {
          extractParaFromConversation();
        }, 1000); // Give a bit more time for the message to settle
      }
    }
  }, [messages, isLoading, extractParaFromConversation]);

  // Handle PARA element confirmation
  const handleConfirmParaElement = async (element: ParaElement) => {
    try {
      // Get Notion configuration from localStorage
      const savedSettings = localStorage.getItem(`user_settings_${user?.id}`);
      let notionConfig = null;
      
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          
          // Check for notionToken and any database ID (could be legacy notionDatabaseId or any PARA database)
          const databaseId = settings.notionDatabaseId || 
                            settings.projectsDatabaseId || 
                            settings.areasDatabaseId || 
                            settings.resourcesDatabaseId || 
                            settings.archiveDatabaseId;
                            
          if (settings.notionToken && databaseId) {
            notionConfig = {
              notionToken: settings.notionToken,
              notionDatabaseId: databaseId,
            };
          }
        } catch (e) {
          console.error('Failed to parse settings', e);
        }
      }

      if (!notionConfig) {
        toast({ 
          title: 'Notion not configured', 
          description: 'Go to Settings to add your Notion token and database ID', 
          variant: 'destructive' 
        });
        return;
      }

      // First, push to Notion
      const res = await fetch('/api/push-para-to-notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          paraElements: [element], // Send single element as array
          notionConfig: notionConfig // Send Notion config to server
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || 'Failed to push to Notion');
      }

      // Then update local state
      const updatedParaData = { ...paraData };
      const category = element.type === 'project' ? 'projects' : 
                      element.type === 'area' ? 'areas' :
                      element.type === 'resource' ? 'resources' : 'archives';
      
      const index = updatedParaData[category].findIndex(e => e.id === element.id);
      if (index !== -1) {
        updatedParaData[category][index] = { ...element, confirmed: true };
        setParaData(updatedParaData);
        onExtractedPara?.(updatedParaData);
        toast({ 
          title: 'Success!', 
          description: `${element.title} confirmed and saved to Notion` 
        });
      }
    } catch (error: unknown) {
      console.error('[PARA Confirmation Error]', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({ 
        title: 'Failed to save to Notion', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    }
  };

  // Handle PARA element rejection
  const handleRejectParaElement = (elementId: string) => {
    const updatedParaData = { ...paraData };
    
    // Find and remove the element from all categories
    Object.keys(updatedParaData).forEach(category => {
      const key = category as keyof ParaData;
      updatedParaData[key] = updatedParaData[key].filter(e => e.id !== elementId);
    });
    
    setParaData(updatedParaData);
    onExtractedPara?.(updatedParaData);
    toast({ title: 'Element rejected', description: 'Element removed from suggestions' });
  };


  const handleVoiceInput = async () => {
    if (isRecording) {
      console.log('[Voice] Stopping recording...');
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      console.log('[Voice] Requesting mic access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[Voice] Got stream:', stream);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log('[Voice] ondataavailable:', event.data);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('[Voice] Recording stopped. Preparing to send...');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('[Voice] Blob size:', audioBlob.size);

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        try {
          const res = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            throw new Error(`Transcription failed: ${res.status} ${res.statusText}`);
          }
          
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Expected JSON response but got ${contentType}`);
          }

          const data = await res.json();
          console.log('[Voice] Transcription response:', data);

          if (data?.text) {
            handleInputChange({ target: { value: data.text } } as React.ChangeEvent<HTMLTextAreaElement>);
            toast({ title: 'Transcribed', description: data.text });
          } else {
            toast({ title: 'Transcription failed', variant: 'destructive' });
          }
        } catch (error: unknown) {
          console.error('[Voice] Transcription error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          toast({ title: 'Transcription error', description: errorMessage, variant: 'destructive' });
        }
      };

      mediaRecorder.start();
      console.log('[Voice] Recording started');
      setIsRecording(true);
    } catch (error: unknown) {
      console.error('[Mic error]', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({ title: 'Mic error', description: errorMessage, variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  }, [error, toast]);

  return (
    <div className="flex gap-4 h-[600px] w-full">
      <Card className="p-4 flex flex-col flex-1">
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
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
            className="border-t pt-4 flex flex-col space-y-2"
          >
            <Textarea
              placeholder="Type your message here... (PARA elements will be extracted automatically)"
              value={input}
              onChange={handleInputChange}
              rows={2}
              className="min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="btn-primary"
              >
                {isLoading ? 'Sending...' : 'Send'}
              </Button>
              <Button 
                type="button" 
                onClick={handleVoiceInput} 
                className="btn-outline"
              >
                {isRecording ? 'Stop Recording' : 'Voice Input'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <ParaSidebar 
        paraData={paraData}
        onConfirmElement={handleConfirmParaElement}
        onRejectElement={handleRejectParaElement}
        isExtracting={isExtractingPara}
      />
    </div>
  );
}