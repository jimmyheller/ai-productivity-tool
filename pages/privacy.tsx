// pages/privacy.tsx
'use client';

import Head from 'next/head';
import Header from '@/components/Header';

export default function PrivacyPolicy() {
    return (
        <>
            <Head>
                <title>Privacy Policy - AI Productivity Tool</title>
            </Head>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <Header />
                <main className="max-w-3xl mx-auto px-4 py-12">
                    <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
                    <p className="mb-4 text-sm text-gray-600">Effective Date: April 19, 2025</p>

                    <h2 className="text-xl font-semibold mt-6 mb-2">1. Introduction</h2>
                    <p className="mb-4">
                        Welcome to the AI Productivity Tool. Your privacy is important to us. This Privacy Policy explains what
                        information we collect, how we use it, and your rights regarding that information. This applies to both our
                        Chrome extension and our web application (https://ai-productivity-tool.vercel.app).
                    </p>

                    <h2 className="text-xl font-semibold mt-6 mb-2">2. Information We Collect</h2>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>
                            <strong>User-Provided Information:</strong> Authentication info (e.g., name, email via Clerk), Notion API
                            credentials stored locally.
                        </li>
                        <li>
                            <strong>Automatically Collected:</strong> Usage metrics (anonymized), voice input (temporary, for transcription only).
                        </li>
                    </ul>

                    <h2 className="text-xl font-semibold mt-6 mb-2">3. How We Use Your Information</h2>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Enable core features like AI input and Notion integration</li>
                        <li>Personalize user experience</li>
                        <li>Improve app performance and detect issues</li>
                    </ul>

                    <h2 className="text-xl font-semibold mt-6 mb-2">4. Data Storage and Retention</h2>
                    <p className="mb-4">
                        We store user data locally in the browser. Audio data for transcription is discarded after use.
                    </p>

                    <h2 className="text-xl font-semibold mt-6 mb-2">5. Third-Party Services</h2>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Clerk for authentication</li>
                        <li>Notion API for task sync</li>
                        <li>OpenAI for optional AI processing</li>
                    </ul>

                    <h2 className="text-xl font-semibold mt-6 mb-2">6. User Controls and Choices</h2>
                    <p className="mb-4">
                        You can sign out, revoke Notion access, and delete local settings at any time via the settings page.
                    </p>

                    <h2 className="text-xl font-semibold mt-6 mb-2">7. Data Security</h2>
                    <p className="mb-4">We use secure API connections and local browser storage for your data.</p>

                    <h2 className="text-xl font-semibold mt-6 mb-2">8. Children’s Privacy</h2>
                    <p className="mb-4">We do not knowingly collect information from children under 13.</p>

                    <h2 className="text-xl font-semibold mt-6 mb-2">9. Contact Us</h2>
                    <p className="mb-4">
                        Questions or concerns? Contact us at <strong>todoproject.2025@gmail.com</strong> (update this address before launch).
                    </p>
                </main>
            </div>
        </>
    );
}
