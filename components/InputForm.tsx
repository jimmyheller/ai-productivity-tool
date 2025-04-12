'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import StructuredPreview from './StructuredPreview';

type StructuredData = {
  tasks: Array<{
    title: string;
    priority?: string;
    dueDate?: string;
    category?: string;
  }>;
  notes: string[];
  ideas: string[];
};

interface Props {
  onStructuredData: (structured: StructuredData) => void;
}

export default function InputForm({ onStructuredData }: Props) {
  const [input, setInput] = useState('');
  const [structured, setStructured] = useState<StructuredData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // whisper
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();

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
            setInput((prev) => (prev ? `${prev} ${data.text}` : data.text));
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

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsSubmitting(true);
    setStructured(null);

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });

      if (!res.ok) throw new Error('Failed to get structured output');

      const json = await res.json();
      if (json.structured) {
        setStructured(json.structured);
        onStructuredData(json.structured);
        toast({ title: 'Success', description: 'AI structured your input' });
      } else {
        toast({ title: 'No structure found', variant: 'destructive' });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4">
      <CardContent className="flex flex-col space-y-4">
        <Textarea
          placeholder="Dump your thoughts here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
        />
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={isSubmitting || !input.trim()}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
          <Button onClick={handleVoiceInput}>
            {isRecording ? 'Stop Recording' : 'Start Voice Input'}
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}