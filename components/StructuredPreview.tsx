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
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSendToNotion = async () => {
        if (!data.tasks || data.tasks.length === 0) return;

        setIsSubmitting(true);

        try {
            const res = await fetch('/api/push-to-notion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tasks: data.tasks }),
            });

            if (!res.ok) {
                throw new Error('Failed to push tasks to Notion');
            }

            toast({ title: 'Success', description: 'Tasks sent to Notion' });
        } catch (err) {
            console.error('[Notion Sync Error]', err);
            toast({
                title: 'Error sending to Notion',
                description: (err as Error).message || 'Unknown error',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // const handleSendToNotion = async () => {
    //     const firstTask = data.tasks?.[0];
    //     if (!firstTask) return;
    //
    //     setIsSubmitting(true);
    //
    //     try {
    //         const res = await fetch('/api/push-to-notion', {
    //             method: 'POST',
    //             headers: {'Content-Type': 'application/json'},
    //             body: JSON.stringify({task: firstTask}),
    //         });
    //
    //         if (!res.ok) {
    //             throw new Error('Failed to push to Notion');
    //         }
    //
    //         console.log('[ Notion Sync Success]');
    //         toast({ title: 'Success', description: 'Task sent to Notion ✅' });
    //     } catch (err) {
    //         console.error('[ Notion Sync Error]', err);
    //         toast({
    //             title: 'Error sending to Notion',
    //             description: (err as Error).message || 'Unknown error',
    //             variant: 'destructive',
    //         });
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // };

    return (
        <Card>
            <CardContent className="p-6 space-y-4">
                {data.tasks?.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">🗂 Tasks</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            {data.tasks.map((task, i) => (
                                <li key={i}>
                                    {task.title}
                                    {task.dueDate && (
                                        <span className="text-sm text-muted-foreground"> (due {task.dueDate})</span>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {/* Send to Notion button */}
                        <Button onClick={handleSendToNotion} disabled={isSubmitting} className="mt-4">
                            {isSubmitting ? 'Submitting...' : 'Send All Tasks to Notion'}
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
