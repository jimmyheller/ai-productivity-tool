'use client';

import {useState, useRef} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Textarea} from '@/components/ui/textarea';
import {useToast} from '@/hooks/use-toast';
import StructuredPreview from './StructuredPreview';

interface Props {
    onStructuredData: (structured: any) => void;
}

export default function InputForm({onStructuredData}: Props) {
    const [input, setInput] = useState('');
    const [structured, setStructured] = useState<any | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    //whisper
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);


    const {toast} = useToast();

    const handleVoiceInput = async () => {
        if (isRecording) {
            console.log('[Voice] Stopping recording...');
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
            return;
        }

        try {
            console.log('[Voice] Requesting mic access...');
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});
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
                const audioBlob = new Blob(audioChunksRef.current, {type: 'audio/webm'});
                console.log('[Voice] Blob size:', audioBlob.size);

                const formData = new FormData();
                formData.append('audio', audioBlob, 'recording.webm');

                try {
                    const res = await fetch('/api/transcribe', {
                        method: 'POST',
                        body: formData,
                    });

                    const data = await res.json();
                    console.log('[Voice] Transcription response:', data);

                    if (data?.text) {
                        setInput((prev) => (prev ? `${prev} ${data.text}` : data.text));
                        toast({title: 'Transcribed', description: data.text});
                    } else {
                        toast({title: 'Transcription failed', variant: 'destructive'});
                    }
                } catch (err: any) {
                    console.error('[Voice] Transcription error:', err);
                    toast({title: 'Transcription error', description: err.message, variant: 'destructive'});
                }
            };

            mediaRecorder.start();
            console.log('[Voice] Recording started');
            setIsRecording(true);
        } catch (err: any) {
            console.error('[Mic error]', err);
            toast({title: 'Mic error', description: err.message, variant: 'destructive'});
        }
    };


    const handleSubmit = async () => {
        if (!input.trim()) return;

        setIsSubmitting(true);
        setStructured(null);

        try {
            const res = await fetch('/api/submit', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({input}),
            });

            if (!res.ok) throw new Error('Failed to get structured output');

            const json = await res.json();
            if (json.structured) {
                setStructured(json.structured);
                onStructuredData(json.structured);
                toast({title: 'Success', description: 'AI structured your input'});
            } else {
                toast({title: 'No structure found', variant: 'destructive'});
            }
        } catch (err: any) {
            toast({title: 'Error', description: err.message, variant: 'destructive'});
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

                {structured && <StructuredPreview data={structured}/>}
            </CardContent>
        </Card>
    );
}
