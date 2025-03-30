// pages/index.tsx
import InputForm from '../components/InputForm';

export default function Home() {
    const handleInputSubmit = async (inputText: string) => {
        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: inputText }),
            });

            if (!response.ok) throw new Error('Failed to submit');
            alert('Submitted successfully');
        } catch (error) {
            console.error(error);
            alert('Error submitting input');
        }
    };

    return (
        <div>
            <h1>AI Productivity Tool</h1>
            <InputForm onSubmit={handleInputSubmit} />
        </div>
    );
}
