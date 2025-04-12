'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

type StructuredData = {
    tasks: { title: string; priority?: string; dueDate?: string; category?: string }[];
    notes: string[];
    ideas: string[];
};

export default function StructuredPreview({ data }: { data: StructuredData }) {
    const { toast } = useToast();
    const { isSignedIn, user } = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sentTasks, setSentTasks] = useState<string[]>([]);
    const [notionError, setNotionError] = useState<string | null>(null);

    const handleSendToNotion = async () => {
        if (!data.tasks || data.tasks.length === 0) return;
        if (!isSignedIn) {
            toast({
                title: 'Authentication required',
                description: 'Please sign in to send tasks to Notion',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        setNotionError(null);

        try {
            const res = await fetch('/api/push-to-notion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tasks: data.tasks }),
            });

            const result = await res.json();

            if (!res.ok) {
                // Check if it's a Notion configuration error
                if (result.details && result.details.includes('Notion client not configured')) {
                    setNotionError('Notion API not configured');
                    toast({
                        title: 'Notion settings required',
                        description: 'Please configure your Notion API settings first',
                        variant: 'destructive',
                    });
                } else {
                    throw new Error(result.details || 'Failed to push tasks to Notion');
                }
            } else {
                setSentTasks(data.tasks.map((t) => t.title));
                toast({ title: 'Success', description: `${result.count} tasks sent to Notion` });
            }
        } catch (error: unknown) {
            console.error('[Notion Sync Error]', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast({
                title: 'Error sending to Notion',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardContent className="p-6 space-y-4">
                {data.tasks?.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">🗂 Tasks</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            {data.tasks.map((task, i) => {
                                const isSent = sentTasks.includes(task.title);
                                return (
                                    <li key={i}
                                        className={`flex items-center justify-between ${isSent ? 'text-muted-foreground' : ''}`}>
                                        <span>
                                            {task.title}
                                            {task.dueDate && (
                                                <span className="text-sm text-muted-foreground"> (due {task.dueDate})</span>
                                            )}
                                        </span>
                                        {isSent && <span className="text-green-600 text-sm ml-2">✓ Sent</span>}
                                    </li>
                                );
                            })}
                        </ul>

                        {notionError ? (
                            <div className="mt-4 space-y-2">
                                <p className="text-sm text-red-600">{notionError}</p>
                                <Link href="/settings" className="text-sm text-blue-600 hover:underline">
                                    Configure Notion Settings
                                </Link>
                            </div>
                        ) : (
                            <Button
                                onClick={handleSendToNotion}
                                disabled={isSubmitting || sentTasks.length === data.tasks.length}
                                className="mt-4"
                            >
                                {sentTasks.length === data.tasks.length
                                    ? 'All Tasks Sent'
                                    : isSubmitting
                                        ? 'Submitting...'
                                        : 'Send All Tasks to Notion'}
                            </Button>
                        )}
                    </div>
                )}

                {data.ideas?.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">💡 Ideas</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            {data.ideas.map((idea, i) => (
                                <li key={i}>{idea}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {data.notes?.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">📝 Notes</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            {data.notes.map((note, i) => (
                                <li key={i}>{note}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}