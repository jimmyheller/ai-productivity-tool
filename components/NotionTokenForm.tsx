import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserSettings } from '@/hooks/use-user-settings';

interface NotionTokenFormProps {
  settings: UserSettings;
  onSettingChange: (name: string, value: string) => void;
  onSave: () => void;
  onCancel?: () => void;
  isSaving: boolean;
  isCreating: boolean;
  setupNotion?: boolean;
}

export default function NotionTokenForm({
  settings,
  onSettingChange,
  onSave,
  onCancel,
  isSaving,
  isCreating,
  setupNotion = false
}: NotionTokenFormProps) {
  const [tokenError, setTokenError] = useState('');

  const handleTokenChange = (value: string) => {
    onSettingChange('notionToken', value);
    
    if (value && value.length < 50) {
      setTokenError('Token appears to be too short');
    } else {
      setTokenError('');
    }
  };

  const hasUnsavedChanges = settings.notionToken && !tokenError;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="notionToken">Notion API Token</Label>
          {tokenError ? (
            <span className="text-xs text-red-500">{tokenError}</span>
          ) : hasUnsavedChanges ? (
            <span className="text-xs text-amber-500 font-medium">Unsaved changes</span>
          ) : null}
        </div>
        <Input
          id="notionToken"
          name="notionToken"
          type="password"
          value={settings.notionToken || ''}
          onChange={(e) => handleTokenChange(e.target.value)}
          className={tokenError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
        />
        <div className="flex justify-between text-xs">
          <a
            href="https://www.notion.so/my-integrations"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Get your Notion token
          </a>
          <span className="text-slate-500">Format: ntn_123...</span>
        </div>

        {hasUnsavedChanges && (
          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-center justify-between">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> Your token needs to be saved
              </p>
              <Button
                size="sm"
                onClick={onSave}
                disabled={isSaving || isCreating}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Save Token Now
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2 mt-4">
        <Label htmlFor="notionPageId">Notion Page ID</Label>
        <Input
          id="notionPageId"
          name="notionPageId"
          placeholder="e.g. 2e22de6b0b6e4c0d8f84e1234567890a"
          value={settings.notionPageId || ''}
          onChange={(e) => onSettingChange('notionPageId', e.target.value)}
        />
        <div className="flex justify-between text-xs">
          <a
            href="https://www.notion.so/help/add-and-manage-connections-with-the-api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            How to find page ID
          </a>
          <span className="text-slate-500">32-character ID from URL</span>
        </div>
      </div>

      <div className="mt-4 bg-blue-50 p-3 rounded-md border border-blue-100">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Setting up Notion Integration</h4>

        <h5 className="text-sm font-medium text-blue-700 mt-3">1. Create and Share a Notion Page</h5>
        <ol className="list-decimal list-inside space-y-1 text-xs text-blue-700 mt-1 ml-2">
          <li>Create a new page in your Notion workspace</li>
          <li>Click <strong>Share</strong> in the top right corner</li>
          <li>Add your integration by name in the Invite field</li>
          <li>Copy the page ID from the URL (32-character string)</li>
        </ol>

        <h5 className="text-sm font-medium text-blue-700 mt-3">2. Enter Required Information</h5>
        <ol className="list-decimal list-inside space-y-1 text-xs text-blue-700 mt-1 ml-2">
          <li>Enter your Notion API token above</li>
          <li>Enter the page ID of the shared page</li>
          <li>Click the <strong>Save & Setup Notion Integration</strong> button</li>
        </ol>

        <h5 className="text-sm font-medium text-blue-700 mt-3">3. PARA Framework Creation</h5>
        <p className="text-xs text-blue-700 mt-1">
          Your PARA framework will include four databases:
        </p>
        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 mt-1 ml-2">
          <li><strong>Projects:</strong> Short-term efforts with deadlines</li>
          <li><strong>Areas:</strong> Long-term responsibilities</li>
          <li><strong>Resources:</strong> Topics of ongoing interest</li>
          <li><strong>Archive:</strong> Inactive items</li>
        </ul>
      </div>

      {/* Action buttons */}
      <div className="w-full flex gap-2 mt-6">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={onSave}
          disabled={isSaving || isCreating}
          className="flex-1"
        >
          {isSaving 
            ? 'Saving...' 
            : isCreating 
            ? 'Creating PARA Framework...' 
            : setupNotion 
            ? 'Create PARA Framework' 
            : settings.notionToken 
            ? 'Save & Setup Notion Integration' 
            : 'Save Settings'
          }
        </Button>
      </div>
    </div>
  );
}