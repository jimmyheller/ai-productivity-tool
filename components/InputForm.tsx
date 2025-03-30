// components/InputForm.tsx
import { useState } from 'react';

interface Props {
    onSubmit: (text: string) => Promise<void>;
}

export default function InputForm({ onSubmit }: Props) {
    const [inputText, setInputText] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (inputText.trim()) {
            await onSubmit(inputText);
            setInputText('');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
      <textarea
          value={inputText}
          onChange={handleChange}
          placeholder="Enter your thoughts..."
          rows={5}
          cols={50}
      />
            <button type="submit">Submit</button>
        </form>
    );
}
