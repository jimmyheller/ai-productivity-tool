import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export interface UserSettings {
  notionToken?: string;
  notionPageId?: string;
  notionDatabaseId?: string;
  projectsDatabaseId?: string;
  areasDatabaseId?: string;
  resourcesDatabaseId?: string;
  archiveDatabaseId?: string;
}

export function useUserSettings() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [settings, setSettings] = useState<UserSettings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load user settings on page load
  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      console.log(`[Loading settings for ${user.id}]`);
      
      const savedSettings = localStorage.getItem(`user_settings_${user.id}`);
      
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
        } catch (e) {
          console.error('Failed to parse settings', e);
        }
      }
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, user]);

  // Update field values
  const updateSetting = (name: string, value: string) => {
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  // Save settings to localStorage
  const saveSettings = async (): Promise<UserSettings> => {
    if (!isSignedIn || !user?.id) {
      throw new Error('User not signed in or user ID not available');
    }

    setIsSaving(true);
    try {
      // Remove notionDatabaseId from settings as we're using PARA framework instead
      const updatedSettings = { ...settings };
      delete updatedSettings.notionDatabaseId;

      // Save the current settings
      const settingsToSave = JSON.stringify(updatedSettings);
      localStorage.setItem(`user_settings_${user.id}`, settingsToSave);

      // Verify settings were saved correctly
      const savedSettings = localStorage.getItem(`user_settings_${user.id}`);
      if (!savedSettings) {
        throw new Error('Failed to save settings to localStorage');
      }

      setSettings(updatedSettings);
      return updatedSettings;
    } finally {
      setIsSaving(false);
    }
  };

  // Update settings with PARA database IDs
  const updateParaDatabaseIds = (databaseIds: {
    projects: string;
    areas: string;
    resources: string;
    archive: string;
  }) => {
    if (!user?.id) return;

    const updatedSettings = {
      ...settings,
      projectsDatabaseId: databaseIds.projects,
      areasDatabaseId: databaseIds.areas,
      resourcesDatabaseId: databaseIds.resources,
      archiveDatabaseId: databaseIds.archive,
    };

    setSettings(updatedSettings);

    // Save to localStorage
    const settingsToSave = JSON.stringify(updatedSettings);
    localStorage.setItem(`user_settings_${user.id}`, settingsToSave);
  };

  // Reset to saved settings (for cancel functionality)
  const resetSettings = () => {
    if (!user?.id) return;
    
    const savedSettings = localStorage.getItem(`user_settings_${user.id}`);
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  };

  return {
    settings,
    isLoading,
    isSaving,
    updateSetting,
    saveSettings,
    updateParaDatabaseIds,
    resetSettings,
    isSignedIn,
    user,
  };
}