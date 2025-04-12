'use client';

import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {useState} from 'react';
import {useToast} from '@/hooks/use-toast';

type StructuredData = {
    tasks: { title: string; priority?: string; dueDate?: string; category?: string }[];
    notes: string[];
    ideas: string[];
};

export default function StructuredPreview({data}: { data: StructuredData }) {
    const {toast} = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sentTasks, setSentTasks] = useState<string[]>([]);

    const handleSendToNotion = async () => {
        if (!data.tasks || data.tasks.length === 0) return;

        setIsSubmitting(true);

        try {
            const res = await fetch('/api/push-to-notion', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({tasks: data.tasks}),
            });

            if (!res.ok) {
                throw new Error('Failed to push tasks to Notion');
            }

            setSentTasks(data.tasks.map((t) => t.title));
            toast({title: 'Success', description: 'Tasks sent to Notion'});
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