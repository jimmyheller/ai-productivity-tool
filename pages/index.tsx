// pages/index.tsx
import Head from 'next/head';
import InputForm from '@/components/InputForm';

export default function Home() {
    return (
        <>
            <Head>
                <title>AI Productivity Tool</title>
            </Head>
            <main
                className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl space-y-6">
                    <h1 className="text-4xl font-bold text-center text-slate-800">
                        AI Productivity Tool
                    </h1>
                    <InputForm onSubmit={async () => {
                    }}/>
                </div>
            </main>
        </>
    );
}
