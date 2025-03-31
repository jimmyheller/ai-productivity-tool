import { Card, CardContent } from '@/components/ui/card';

type StructuredData = {
    tasks: { title: string; priority?: string; dueDate?: string; category?: string }[];
    notes: string[];
    ideas: string[];
};

export default function StructuredPreview({ data }: { data: StructuredData }) {
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
