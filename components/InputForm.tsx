'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import StructuredPreview from './StructuredPreview';
import {useToast} from "@/hooks/use-toast";

interface Props {
  onSubmit?: (text: string) => void;
}

export default function InputForm({ onSubmit }: Props) {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [structured, setStructured] = useState<any | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      toast({ title: 'Input required', description: 'Please enter something.' });
      return;
    }

    setLoading(true);
    setStructured(null); // reset
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify({ input: inputText }),
        headers: { 'Content-Type': 'application/json' },
      });


      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Submission failed');
      }

      toast({ title: 'Submitted!', description: 'Sent to Notion ✅' });
      if (onSubmit) onSubmit(inputText);
      setStructured(data.structured);
      setInputText('');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="space-y-6 w-full max-w-2xl">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Textarea
                  placeholder="What's on your mind?"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={4}
                  className="resize-none"
              />
              <Button type="submit" disabled={loading} className="self-end">
                {loading ? 'Thinking...' : 'Submit'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {structured && <StructuredPreview data={structured} />}
      </div>
  );
}
