// components/InputForm.tsx
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface Props {
  onSubmit: (text: string) => Promise<void>;
}

export default function InputForm({ onSubmit }: Props) {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setLoading(true);
    await onSubmit(inputText);
    setInputText('');
    setLoading(false);
  };

  return (
      <Card className="w-full max-w-xl bg-white border border-gray-200 shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="What's on your mind?"
                rows={5}
                className="resize-none"
            />
            <Button type="submit" disabled={loading} className="self-end">
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </form>
        </CardContent>
      </Card>
  );
}

