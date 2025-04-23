'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useChat } from 'ai/react';

type Task = {
  title: string;
  priority?: string;
  dueDate?: string;
  category?: string;
};

interface Props {
  onExtractedTasks: (tasks: Task[]) => void;
}

export default function ChatInterface({ onExtractedTasks }: Props) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
  });
  
  const [isRecording, setIsRecording] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Extract tasks from the conversation
  const handleExtractTasks = async () => {
    if (messages.length < 2) {
      toast({ 
        title: 'Not enough conversation', 
        description: 'Have a conversation first to extract tasks', 
        variant: 'destructive' 
      });
      return;
    }

    setIsExtracting(true);

    try {
      // For debugging, log what we're sending
      console.log('[Extract Tasks] Sending messages:', messages);
      
      const res = await fetch('/api/extract-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: messages
        }),
      });

      if (!res.ok) throw new Error('Failed to extract tasks');

      const data = await res.json();
      console.log('[Extract Tasks] Received:', data);
      
      if (data.tasks && data.tasks.length > 0) {
        onExtractedTasks(data.tasks);
        toast({ title: 'Success', description: `Extracted ${data.tasks.length} tasks` });
      } else {
        toast({ title: 'No tasks found', description: 'No tasks were found in the conversation' });
      }
    } catch (error: unknown) {
      console.error('[Task Extraction Error]', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsExtracting(false);
    }
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

  if (error) {
    toast({ title: 'Error', description: error.message, variant: 'destructive' });
  }

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
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
          className="border-t pt-4 flex flex-col space-y-2"
        >
          <Textarea
            placeholder="Type your message here..."
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
            <Button 
              type="button" 
              onClick={handleExtractTasks} 
              disabled={isExtracting}
              className="btn-outline"
            >
              {isExtracting ? 'Extracting...' : 'Extract Tasks'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}