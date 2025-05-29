import { Button } from '@/components/ui/button';
import type { UserSettings } from '@/hooks/use-user-settings';

interface ParaFrameworkStatusProps {
  settings: UserSettings;
  onEdit: () => void;
}

export default function ParaFrameworkStatus({ settings, onEdit }: ParaFrameworkStatusProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Notion Integration</h3>
          <p className="text-sm text-slate-500">Your Notion integration is set up</p>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
      </div>
      
      {settings.projectsDatabaseId && (
        <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
          <h4 className="text-sm font-medium mb-2">PARA Framework Databases</h4>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>• Projects Database</li>
            <li>• Areas Database</li>
            <li>• Resources Database</li>
            <li>• Archive Database</li>
          </ul>
        </div>
      )}
    </div>
  );
}