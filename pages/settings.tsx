//pages/settings.tsx
'use client';

import {useState, useEffect} from 'react';
import {useUser} from '@clerk/nextjs';
import Head from 'next/head';
import {useRouter} from 'next/router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/input';
import {useToast} from '@/hooks/use-toast';

interface UserSettings {
    notionToken?: string;
    notionPageId?: string;
    notionDatabaseId?: string;
    projectsDatabaseId?: string;
    areasDatabaseId?: string;
    resourcesDatabaseId?: string;
    archiveDatabaseId?: string;
}

export default function Settings() {
    const {isSignedIn, isLoaded, user} = useUser();
    const [settings, setSettings] = useState<UserSettings>({});
    const [, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isCreatingPara, setIsCreatingPara] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [progressStatus, setProgressStatus] = useState('');
    const [progressStep, setProgressStep] = useState(0);
    const [tokenError, setTokenError] = useState('');
    const {toast} = useToast();
    const router = useRouter();
    const {setupNotion} = router.query;

    // Load user settings on page load
    useEffect(() => {
        console.log('useEffect for loading settings triggered');
        console.log('isLoaded:', isLoaded, 'isSignedIn:', isSignedIn, 'user:', user);

        if (isLoaded && isSignedIn && user && user.id) {
            // We'll load settings from localStorage for now
            // In a production app, you'd want to store this server-side
            console.log(`[Loading settings for ${user.id}]`);

            // Debug localStorage
            try {
                const allKeys = [];
                for (let i = 0; i < localStorage.length; i++) {
                    allKeys.push(localStorage.key(i));
                }
                console.log('All localStorage keys:', allKeys);
            } catch (e) {
                console.error('Error listing localStorage keys:', e);
            }

            const savedSettings = localStorage.getItem(`user_settings_${user.id}`);
            console.log(`[Retrieved from localStorage for ${user.id}]:`, savedSettings);

            if (savedSettings) {
                try {
                    const parsedSettings = JSON.parse(savedSettings);
                    console.log(`[Parsed settings for ${user.id}]`, parsedSettings);
                    setSettings(parsedSettings);
                    console.log('Settings state after update:', parsedSettings);
                } catch (e) {
                    console.error('Failed to parse settings', e);
                }
            } else {
                console.log(`[No saved settings found for ${user.id}]`);
            }
            setIsLoading(false);
        }
    }, [isLoaded, isSignedIn, user]);

    const saveSettings = async () => {
        if (!isSignedIn || !user || !user.id) {
            console.error('User not signed in or user ID not available');
            toast({
                title: 'Error',
                description: 'You must be signed in to save settings.',
                variant: 'destructive',
            });
            return;
        }

        console.log(`[Saving settings for ${user.id}]`);

        // Validate token if it exists
        if (settings.notionToken) {
            console.log(`[Validating token for ${user.id}]`);
            if (settings.notionToken.length < 50) {
                toast({
                    title: 'Invalid token length',
                    description: 'Your Notion token appears to be too short',
                    variant: 'destructive',
                });
                setTokenError('Token appears to be too short');
                return;
            }
        }

        setIsSaving(true);
        try {
            // Remove notionDatabaseId from settings as we're using PARA framework instead
            const updatedSettings = {...settings};
            delete updatedSettings.notionDatabaseId;
            console.log(`[Removing notionDatabaseId for ${user.id}]`);

            // Save the current settings
            const settingsToSave = JSON.stringify(updatedSettings);
            localStorage.setItem(`user_settings_${user.id}`, settingsToSave);
            console.log(`[Saved settings for ${user.id}]`, updatedSettings);

            // Verify settings were saved correctly
            const savedSettings = localStorage.getItem(`user_settings_${user.id}`);
            if (!savedSettings) {
                throw new Error('Failed to save settings to localStorage');
            }

            // If we have a token, always check for or create a PARA framework
            if (settings.notionToken) {
                console.log(`[Checking for PARA framework for ${user.id}]`);
                // Always check for PARA framework when a valid token is present
                await checkAndCreateParaFramework();
            } else {
                toast({
                    title: 'Settings saved',
                    description: 'Your settings have been saved.',
                });

                // Exit editing mode if we were editing
                if (isEditing) {
                    setIsEditing(false);
                }
            }
        } catch (error) {
            console.error('Failed to save settings', error);
            toast({
                title: 'Error saving settings',
                description: error instanceof Error ? error.message : 'There was a problem saving your settings.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Check if a PARA framework already exists and create one if it doesn't
    const checkAndCreateParaFramework = async () => {
        if (!isSignedIn || !user || !user.id) {
            console.error('User not signed in or user ID not available');
            toast({
                title: 'Authentication Error',
                description: 'You must be signed in to check or create a PARA framework.',
                variant: 'destructive',
            });
            return;
        }

        if (!settings.notionToken) {
            toast({
                title: 'Missing Notion token',
                description: 'Please provide a Notion API token to check your PARA framework.',
                variant: 'destructive',
            });
            return;
        }

        setIsCreatingPara(true);
        setProgressStep(1);
        setProgressStatus('Checking for existing PARA framework...');

        try {
            console.log(`[Checking PARA framework for user ${user.id} with token]`);

            // First, check if a PARA framework already exists with this token
            const checkResponse = await fetch('/api/check-para-framework', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    notionToken: settings.notionToken,
                    notionPageId: settings.notionPageId,
                    userId: user.id
                }),
            });

            console.log('Check response status:', checkResponse.status);

            if (!checkResponse.ok) {
                const errorText = await checkResponse.text();
                console.error('Error response:', errorText);
                throw new Error(`Failed to check for existing PARA framework: ${checkResponse.status} ${errorText}`);
            }

            const checkData = await checkResponse.json();
            console.log('Check data:', checkData);
            setProgressStep(2);

            if (checkData.exists) {
                setProgressStatus('Found existing PARA framework. Connecting...');

                // PARA framework already exists, use the existing database IDs
                const updatedSettings = {
                    ...settings,
                    projectsDatabaseId: checkData.databaseIds.projects,
                    areasDatabaseId: checkData.databaseIds.areas,
                    resourcesDatabaseId: checkData.databaseIds.resources,
                    archiveDatabaseId: checkData.databaseIds.archive,
                };

                setSettings(updatedSettings);

                // Save the updated settings
                const settingsToSave = JSON.stringify(updatedSettings);
                localStorage.setItem(`user_settings_${user.id}`, settingsToSave);
                console.log(`[Saved updated settings with PARA framework IDs for ${user.id}]`, updatedSettings);

                // Verify settings were saved correctly
                const savedSettings = localStorage.getItem(`user_settings_${user.id}`);
                if (!savedSettings) {
                    throw new Error('Failed to save settings with PARA framework IDs to localStorage');
                }

                setProgressStep(4); // Skip to completion
                setProgressStatus('Connected to existing PARA framework!');

                toast({
                    title: 'PARA Framework Found',
                    description: 'Your existing PARA framework has been connected successfully!',
                });

                // Exit editing mode
                setIsEditing(false);

                // Short delay to show completion status
                setTimeout(() => {
                    setProgressStatus('');
                    setProgressStep(0);
                    setIsCreatingPara(false);
                }, 1500);
            } else {
                // No existing PARA framework, create a new one
                setProgressStatus('No existing framework found. Creating new PARA framework...');
                await createParaFramework(true); // Pass true to indicate we're already in the process
            }
        } catch (error) {
            console.error('Failed to check for PARA framework', error);
            setProgressStatus('Error checking for PARA framework');
            toast({
                title: 'Error checking PARA framework',
                description: error instanceof Error ? error.message : 'There was a problem checking for an existing PARA framework in Notion.',
                variant: 'destructive',
            });

            // Reset progress on error
            setTimeout(() => {
                setProgressStatus('');
                setProgressStep(0);
                setIsCreatingPara(false);
            }, 1500);
        }
    };

    // Create PARA framework in Notion
    const createParaFramework = async (continueFromCheck = false) => {
        if (!isSignedIn || !user || !user.id) {
            console.error('User not signed in or user ID not available');
            toast({
                title: 'Authentication Error',
                description: 'You must be signed in to create a PARA framework.',
                variant: 'destructive',
            });
            return;
        }

        if (!settings.notionToken) {
            toast({
                title: 'Missing Notion token',
                description: 'Please provide a Notion API token to create your PARA framework.',
                variant: 'destructive',
            });
            return;
        }

        if (!continueFromCheck) {
            setIsCreatingPara(true);
            setProgressStep(1);
            setProgressStatus('Preparing to create PARA framework...');
        }

        try {
            setProgressStep(continueFromCheck ? 3 : 2);
            setProgressStatus('Creating PARA framework in Notion...');

            console.log(`[Creating PARA framework for user ${user.id} with token]`);

            const response = await fetch('/api/create-para-framework', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    notionToken: settings.notionToken,
                    notionPageId: settings.notionPageId,
                    userId: user.id
                }),
            });

            console.log('Create response status:', response.status);

            if (!response.ok) {
                let errorMessage = 'Failed to create PARA framework';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.details || errorMessage;
                } catch (e) {
                    console.error('Could not parse error response', e);
                    const errorText = await response.text();
                    errorMessage = `${errorMessage}: ${response.status} ${errorText}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Create data:', data);
            setProgressStep(4);
            setProgressStatus('PARA framework created successfully!');

            // Save the database IDs
            const updatedSettings = {
                ...settings,
                projectsDatabaseId: data.databaseIds.projects,
                areasDatabaseId: data.databaseIds.areas,
                resourcesDatabaseId: data.databaseIds.resources,
                archiveDatabaseId: data.databaseIds.archive,
            };

            setSettings(updatedSettings);

            // Save the updated settings
            const settingsToSave = JSON.stringify(updatedSettings);
            localStorage.setItem(`user_settings_${user.id}`, settingsToSave);
            console.log(`[Saved settings with new PARA framework IDs for ${user.id}]`, updatedSettings);

            // Verify settings were saved correctly
            const savedSettings = localStorage.getItem(`user_settings_${user.id}`);
            if (!savedSettings) {
                throw new Error('Failed to save settings with new PARA framework IDs to localStorage');
            }

            toast({
                title: 'PARA Framework Created',
                description: 'Your PARA framework has been set up in Notion successfully!',
            });

            // Exit editing mode if we were editing
            if (isEditing) {
                setIsEditing(false);
            } else if (setupNotion === 'true') {
                // Redirect to the main page after a short delay if coming from onboarding
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            }

            // Reset progress after a delay to show completion
            setTimeout(() => {
                setProgressStatus('');
                setProgressStep(0);
                setIsCreatingPara(false);
            }, 2000);
        } catch (error) {
            console.error('Failed to create PARA framework', error);
            setProgressStatus('Error creating PARA framework');
            toast({
                title: 'Error creating PARA framework',
                description: error instanceof Error ? error.message : 'There was a problem setting up your PARA framework in Notion.',
                variant: 'destructive',
            });

            // Reset progress on error after a delay
            setTimeout(() => {
                setProgressStatus('');
                setProgressStep(0);
                setIsCreatingPara(false);
            }, 1500);
        }
    };

    // Update field values
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        console.log(`handleChange called for ${name} with value length: ${value.length}`);
        console.log('Current settings before update:', settings);

        setSettings(prev => {
            const newSettings = {...prev, [name]: value};
            console.log('New settings after update:', newSettings);
            return newSettings;
        });

        // Clear token error when user is typing
        if (name === 'notionToken') {
            if (value && value.length < 50) {
                setTokenError('Token appears to be too short');
            } else {
                setTokenError('');
            }
        }
    };

    // If not signed in, show a message
    if (isLoaded && !isSignedIn) {
        return (
            <>
                <Head>
                    <title>Settings - AI Productivity Tool</title>
                </Head>
                <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
                    <Header/>
                    <main className="flex-1 flex flex-col items-center p-4 pt-8">
                        <div className="w-full max-w-lg">
                            <h1 className="text-2xl font-bold mb-6">User Settings</h1>

                            {setupNotion === 'true' && (
                                <Card className="mb-6">
                                    <CardHeader>
                                        <CardTitle>Set Up Your PARA Framework</CardTitle>
                                        <CardDescription>
                                            Based on the information you provided, well create a personalized PARA
                                            framework in Notion.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-slate-700 mb-4">
                                            PARA stands for Projects, Areas, Resources, and Archive. This framework will
                                            help you organize your tasks and information effectively.
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                                            <li><strong>Projects:</strong> Short-term efforts with a deadline</li>
                                            <li><strong>Areas:</strong> Long-term responsibilities you want to maintain
                                            </li>
                                            <li><strong>Resources:</strong> Topics or themes of ongoing interest</li>
                                            <li><strong>Archive:</strong> Inactive items from the other categories</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            <Card>
                                <CardHeader>
                                    <CardTitle>Notion Integration</CardTitle>
                                    <CardDescription>
                                        {setupNotion === 'true'
                                            ? 'Set up your PARA framework in Notion to organize your tasks and information.'
                                            : 'Configure your Notion API integration to manage your productivity system.'}
                                    </CardDescription>
                                </CardHeader>
                                {/*                <CardContent className="space-y-4">*/}
                                {/*                    {isCreatingPara ? (*/}
                                {/*                        <div className="space-y-4">*/}
                                {/*                            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">*/}
                                {/*                                <h3 className="font-medium text-blue-800 mb-3">Setting up your PARA*/}
                                {/*                                    framework</h3>*/}

                                {/*                                <div className="space-y-3">*/}
                                {/*                                    <div className="flex items-center space-x-2">*/}
                                {/*                                        <div*/}
                                {/*                                            className="relative h-1 w-full bg-blue-100 rounded-full overflow-hidden">*/}
                                {/*                                            <div*/}
                                {/*                                                className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-300"*/}
                                {/*                                                style={{width: `${progressStep * 25}%`}}*/}
                                {/*                                            ></div>*/}
                                {/*                                        </div>*/}
                                {/*                                        <span*/}
                                {/*                                            className="text-xs text-blue-800 font-medium whitespace-nowrap">{progressStep}/4</span>*/}
                                {/*                                    </div>*/}

                                {/*                                    <p className="text-sm text-blue-700">{progressStatus}</p>*/}

                                {/*                                    <ul className="space-y-2">*/}
                                {/*                                        <li className={`flex items-center text-xs ${progressStep >= 1 ? 'text-blue-700' : 'text-slate-400'}`}>*/}
                                {/*                                            <span*/}
                                {/*                                                className={`inline-flex items-center justify-center w-5 h-5 mr-2 rounded-full ${progressStep >= 1 ? 'bg-blue-500 text-white' : 'bg-slate-200'}`}>1</span>*/}
                                {/*                                            Checking for existing framework*/}
                                {/*                                        </li>*/}
                                {/*                                        <li className={`flex items-center text-xs ${progressStep >= 2 ? 'text-blue-700' : 'text-slate-400'}`}>*/}
                                {/*                                            <span*/}
                                {/*                                                className={`inline-flex items-center justify-center w-5 h-5 mr-2 rounded-full ${progressStep >= 2 ? 'bg-blue-500 text-white' : 'bg-slate-200'}`}>2</span>*/}
                                {/*                                            Analyzing workspace access*/}
                                {/*                                        </li>*/}
                                {/*                                        <li className={`flex items-center text-xs ${progressStep >= 3 ? 'text-blue-700' : 'text-slate-400'}`}>*/}
                                {/*                                            <span*/}
                                {/*                                                className={`inline-flex items-center justify-center w-5 h-5 mr-2 rounded-full ${progressStep >= 3 ? 'bg-blue-500 text-white' : 'bg-slate-200'}`}>3</span>*/}
                                {/*                                            Creating PARA databases*/}
                                {/*                                        </li>*/}
                                {/*                                        <li className={`flex items-center text-xs ${progressStep >= 4 ? 'text-blue-700' : 'text-slate-400'}`}>*/}
                                {/*                                            <span*/}
                                {/*                                                className={`inline-flex items-center justify-center w-5 h-5 mr-2 rounded-full ${progressStep >= 4 ? 'bg-blue-500 text-white' : 'bg-slate-200'}`}>4</span>*/}
                                {/*                                            Finalizing setup*/}
                                {/*                                        </li>*/}
                                {/*                                    </ul>*/}
                                {/*                                </div>*/}
                                {/*                            </div>*/}
                                {/*                        </div>*/}
                                {/*                    ) : !isEditing && settings.notionToken ? (*/}
                                {/*                        <div className="space-y-4">*/}
                                {/*                            <div className="flex items-center justify-between">*/}
                                {/*                                <div>*/}
                                {/*                                    <h3 className="font-medium">Notion Integration</h3>*/}
                                {/*                                    <p className="text-sm text-slate-500">Your Notion integration is set*/}
                                {/*                                        up</p>*/}
                                {/*                                </div>*/}
                                {/*                                <Button*/}
                                {/*                                    variant="outline"*/}
                                {/*                                    size="sm"*/}
                                {/*                                    onClick={() => setIsEditing(true)}*/}
                                {/*                                >*/}
                                {/*                                    Edit*/}
                                {/*                                </Button>*/}
                                {/*                            </div>*/}
                                {/*                            {settings.projectsDatabaseId && (*/}
                                {/*                                <div className="bg-slate-50 p-3 rounded-md border border-slate-200">*/}
                                {/*                                    <h4 className="text-sm font-medium mb-2">PARA Framework Databases</h4>*/}
                                {/*                                    <ul className="text-xs text-slate-600 space-y-1">*/}
                                {/*                                        <li>• Projects Database</li>*/}
                                {/*                                        <li>• Areas Database</li>*/}
                                {/*                                        <li>• Resources Database</li>*/}
                                {/*                                        <li>• Archive Database</li>*/}
                                {/*                                    </ul>*/}
                                {/*                                </div>*/}
                                {/*                            )}*/}
                                {/*                        </div>*/}
                                {/*                    ) : (*/}
                                {/*                        <>*/}
                                {/*                        <div className="space-y-4">*/}
                                {/*                            <div className="space-y-2">*/}
                                {/*                                <div className="flex justify-between">*/}
                                {/*                                    <Label htmlFor="notionToken">Notion API Token</Label>*/}
                                {/*                                    {tokenError ? (*/}
                                {/*                                        <span className="text-xs text-red-500">{tokenError}</span>*/}
                                {/*                                    ) : settings.notionToken ? (*/}
                                {/*                                        <span*/}
                                {/*                                            className="text-xs text-amber-500 font-medium">Unsaved changes</span>*/}
                                {/*                                    ) : null}*/}
                                {/*                                </div>*/}
                                {/*                                <Input*/}
                                {/*                                    id="notionToken"*/}
                                {/*                                    name="notionToken"*/}
                                {/*                                    type="password"*/}
                                {/*                                    value={settings.notionToken || ''}*/}
                                {/*                                    onChange={(e) => {*/}
                                {/*                                        console.log('Input changed:', e.target.value);*/}
                                {/*                                        handleChange(e);*/}
                                {/*                                    }}*/}
                                {/*                                    className={tokenError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}*/}
                                {/*                                />*/}
                                {/*                                <div className="flex justify-between text-xs">*/}
                                {/*                                    <a*/}
                                {/*                                        href="https://www.notion.so/my-integrations"*/}
                                {/*                                        target="_blank"*/}
                                {/*                                        rel="noopener noreferrer"*/}
                                {/*                                        className="text-blue-500 hover:underline"*/}
                                {/*                                    >*/}
                                {/*                                        Get your Notion token*/}
                                {/*                                    </a>*/}
                                {/*                                    <span className="text-slate-500">Format: ntn_123...</span>*/}
                                {/*                                </div>*/}

                                {/*                                {settings.notionToken && !tokenError && (*/}
                                {/*                                    <div*/}
                                {/*                                        className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-md">*/}
                                {/*                                        <div className="flex items-center justify-between">*/}
                                {/*                                            <p className="text-sm text-amber-800">*/}
                                {/*                                                <strong>Important:</strong> Your token needs to be saved*/}
                                {/*                                            </p>*/}
                                {/*                                            <Button*/}
                                {/*                                                size="sm"*/}
                                {/*                                                onClick={saveSettings}*/}
                                {/*                                                disabled={isSaving || isCreatingPara}*/}
                                {/*                                                className="bg-amber-600 hover:bg-amber-700"*/}
                                {/*                                            >*/}
                                {/*                                                Save Token Now*/}
                                {/*                                            </Button>*/}
                                {/*                                        </div>*/}
                                {/*                                        <h3 className="font-medium">Notion Integration</h3>*/}
                                {/*                                        <p className="text-sm text-slate-500">Your Notion integration is set*/}
                                {/*                                            up</p>*/}
                                {/*                                    </div>*/}
                                {/*                                    <Button*/}
                                {/*                                    variant="outline"*/}
                                {/*                                    size="sm"*/}
                                {/*                                    onClick={() => setIsEditing(true)}*/}
                                {/*                            >*/}
                                {/*                                Edit*/}
                                {/*                            </Button>*/}
                                {/*                        </div>*/}
                                {/*                        {settings.projectsDatabaseId && (*/}
                                {/*                            <div className="bg-slate-50 p-3 rounded-md border border-slate-200">*/}
                                {/*                                <h4 className="text-sm font-medium mb-2">PARA Framework Databases</h4>*/}
                                {/*                                <ul className="text-xs text-slate-600 space-y-1">*/}
                                {/*                                    <li>• Projects Database</li>*/}
                                {/*                                    <li>• Areas Database</li>*/}
                                {/*                                    <li>• Resources Database</li>*/}
                                {/*                                    <li>• Archive Database</li>*/}
                                {/*                                </ul>*/}
                                {/*                            </div>*/}
                                {/*                        )}*/}
                                {/*                        </div>*/}
                                {/*                        ) : (*/}
                                {/*                        <>*/}
                                {/*                        <div className="space-y-4">*/}
                                {/*                        <div className="space-y-2">*/}
                                {/*                        <div className="flex justify-between">*/}
                                {/*                        <Label htmlFor="notionToken">Notion API Token</Label>*/}
                                {/*                    {tokenError ? (*/}
                                {/*                        <span className="text-xs text-red-500">{tokenError}</span>*/}
                                {/*                ) : settings.notionToken ? (*/}
                                {/*                <span className="text-xs text-amber-500 font-medium">Unsaved changes</span>*/}
                                {/*                ) : null}*/}
                                {/*        </div>*/}
                                {/*        <Input*/}
                                {/*            id="notionToken"*/}
                                {/*            name="notionToken"*/}
                                {/*            type="password"*/}
                                {/*            value={settings.notionToken || ''}*/}
                                {/*            onChange={(e) => {*/}
                                {/*                console.log('Input changed:', e.target.value);*/}
                                {/*                handleChange(e);*/}
                                {/*            }}*/}
                                {/*            className={tokenError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}*/}
                                {/*        />*/}
                                {/*        <div className="flex justify-between text-xs">*/}
                                {/*            <a*/}
                                {/*                href="https://www.notion.so/my-integrations"*/}
                                {/*                target="_blank"*/}
                                {/*                rel="noopener noreferrer"*/}
                                {/*                className="text-blue-500 hover:underline"*/}
                                {/*            >*/}
                                {/*                Get your Notion token*/}
                                {/*            </a>*/}
                                {/*            <span className="text-slate-500">Format: ntn_123...</span>*/}
                                {/*        </div>*/}

                                {/*        {settings.notionToken && !tokenError && (*/}
                                {/*            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-md">*/}
                                {/*                <div className="flex items-center justify-between">*/}
                                {/*                    <p className="text-sm text-amber-800">*/}
                                {/*                        <strong>Important:</strong> Your token needs to be saved*/}
                                {/*                    </p>*/}
                                {/*                    <Button*/}
                                {/*                        size="sm"*/}
                                {/*                        onClick={saveSettings}*/}
                                {/*                        disabled={isSaving || isCreatingPara}*/}
                                {/*                        className="bg-amber-600 hover:bg-amber-700"*/}
                                {/*                    >*/}
                                {/*                        Save Token Now*/}
                                {/*                    </Button>*/}
                                {/*                </div>*/}
                                {/*            </div>*/}
                                {/*        )}*/}
                                {/*</div>*/}

                                {/*<div className="space-y-2 mt-4">*/}
                                {/*    <div className="flex justify-between">*/}
                                {/*        <Label htmlFor="notionPageId">Notion Page ID</Label>*/}
                                {/*    </div>*/}
                                {/*    <Input*/}
                                {/*        id="notionPageId"*/}
                                {/*        name="notionPageId"*/}
                                {/*        placeholder="e.g. 2e22de6b0b6e4c0d8f84e1234567890a"*/}
                                {/*        value={settings.notionPageId || ''}*/}
                                {/*        onChange={handleChange}*/}
                                {/*    />*/}
                                {/*    <div className="flex justify-between text-xs">*/}
                                {/*        <a*/}
                                {/*            href="https://www.notion.so/help/add-and-manage-connections-with-the-api"*/}
                                {/*            target="_blank"*/}
                                {/*            rel="noopener noreferrer"*/}
                                {/*            className="text-blue-500 hover:underline"*/}
                                {/*        >*/}
                                {/*            How to find page ID*/}
                                {/*        </a>*/}
                                {/*        <span className="text-slate-500">32-character ID from URL</span>*/}
                                {/*    </div>*/}
                                {/*</div>*/}

                                {/*<div className="mt-4 bg-blue-50 p-3 rounded-md border border-blue-100">*/}
                                {/*    <h4 className="text-sm font-medium text-blue-800 mb-2">Setting up Notion Integration</h4>*/}

                                {/*    <h5 className="text-sm font-medium text-blue-700 mt-3">1. Create and Share a Notion Page</h5>*/}
                                {/*    <ol className="list-decimal list-inside space-y-1 text-xs text-blue-700 mt-1 ml-2">*/}
                                {/*        <li>Create a new page in your Notion workspace</li>*/}
                                {/*        <li>Click <strong>Share</strong> in the top right corner</li>*/}
                                {/*        <li>Add your integration by name in the "Invite" field</li>*/}
                                {/*        <li>Copy the page ID from the URL (32-character string)</li>*/}
                                {/*    </ol>*/}

                                {/*    <h5 className="text-sm font-medium text-blue-700 mt-3">2. Enter Required Information</h5>*/}
                                {/*    <ol className="list-decimal list-inside space-y-1 text-xs text-blue-700 mt-1 ml-2">*/}
                                {/*        <li>Enter your Notion API token above</li>*/}
                                {/*        <li>Enter the page ID of the shared page</li>*/}
                                {/*        <li>Click the <strong>"Save & Setup Notion Integration"</strong> button</li>*/}
                                {/*    </ol>*/}

                                {/*    <h5 className="text-sm font-medium text-blue-700 mt-3">3. PARA Framework Creation</h5>*/}
                                {/*    <p className="text-xs text-blue-700 mt-1">*/}
                                {/*        Your PARA framework will include four databases:*/}
                                {/*    </p>*/}
                                {/*    <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 mt-1 ml-2">*/}
                                {/*        <li><strong>Projects:</strong> Short-term efforts with deadlines</li>*/}
                                {/*        <li><strong>Areas:</strong> Long-term responsibilities</li>*/}
                                {/*        <li><strong>Resources:</strong> Topics of ongoing interest</li>*/}
                                {/*        <li><strong>Archive:</strong> Inactive items</li>*/}
                                {/*    </ul>*/}
                                {/*</div>*/}
                                {/*</CardContent>*/}
                                {/*// <CardFooter>*/}
                                {/*//     {settings.notionToken && !isEditing ? (*/}
                                {/*//         <Button*/}
                                {/*//             onClick={() => router.push('/')}*/}
                                {/*//             className="w-full"*/}
                                {/*//         >*/}
                                {/*//             Return to Dashboard*/}
                                {/*//         </Button>*/}
                                {/*//     ) : (*/}
                                {/*//         <div className="w-full flex gap-2">*/}
                                {/*//             {isEditing && (*/}
                                {/*//                 <Button*/}
                                {/*//                     variant="outline"*/}
                                {/*//                     onClick={() => {*/}
                                {/*//                         setIsEditing(false);*/}
                                {/*//                         // Reset to original values*/}
                                {/*//                         const savedSettings = localStorage.getItem(`user_settings_${user?.id}`);*/}
                                {/*//                         if (savedSettings) {*/}
                                {/*//                             try {*/}
                                {/*//                                 setSettings(JSON.parse(savedSettings));*/}
                                {/*//                             } catch (e) {*/}
                                {/*//                                 console.error('Failed to parse settings', e);*/}
                                {/*//                             }*/}
                                {/*//                         }*/}
                                {/*//                     }}*/}
                                {/*//                     className="flex-1"*/}
                                {/*//                 >*/}
                                {/*//                     Cancel*/}
                                {/*//                 </Button>*/}
                                {/*//             )}*/}
                                {/*//             <Button*/}
                                {/*//                 onClick={saveSettings}*/}
                                {/*//                 disabled={isSaving || isCreatingPara}*/}
                                {/*//                 className="flex-1"*/}
                                {/*//             >*/}
                                {/*//                 {isSaving ? 'Saving...' : isCreatingPara ? 'Creating PARA Framework...' : setupNotion === 'true' ? 'Create PARA Framework' : settings.notionToken ? 'Save & Setup Notion Integration' : 'Save Settings'}*/}
                                {/*//             </Button>*/}
                                {/*//         </div>*/}
                                {/*//     )}*/}
                                {/*// </CardFooter>*/}

                            </Card>
                            {/*<div className="mt-8">*/}
                            {/*    <h2 className="text-lg font-semibold mb-2">How to set up your Notion integration:</h2>*/}
                            {/*    <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">*/}
                            {/*        <li>Go to <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer"*/}
                            {/*                     className="text-blue-500 hover:underline">Notion integrations</a> and create a new*/}
                            {/*            integration*/}
                            {/*        </li>*/}
                            {/*        <li>Give it a name (e.g., &quot;AI Productivity Tool&quot;)</li>*/}
                            {/*        <li>Copy the &quot;Internal Integration Token&quot; and paste it above</li>*/}
                            {/*        {setupNotion === 'true' ? (*/}
                            {/*            <li>Click &quot;Create PARA Framework&quot; to automatically set up your databases</li>*/}
                            {/*        ) : (*/}
                            {/*            <>*/}
                            {/*                <li>Create a new database in Notion for your tasks</li>*/}
                            {/*                <li>In your database, click &quot;Share&quot; and add your integration</li>*/}
                            {/*                <li>Copy the database ID from the URL and paste it above</li>*/}
                            {/*            </>*/}
                            {/*        )}*/}
                            {/*    </ol>*/}
                            {/*</div>*/}
                            {/*<li>Click &quot;Create PARA Framework&quot; to automatically set up your databases</li>*/}
                            {/*) :*/}
                            {/*(*/}
                            {/*    <>*/}
                            {/*    <li>Create a new database in Notion for your tasks</li>*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                        </div>
                    </main>
                    <Footer/>
                </div>
            </>
        );
    }


}