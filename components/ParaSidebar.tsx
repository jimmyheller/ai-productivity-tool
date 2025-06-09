'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Archive, Folder, BookOpen, Target } from 'lucide-react';

type ParaElement = {
  id: string;
  title: string;
  description?: string;
  type: 'project' | 'area' | 'resource' | 'archive';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags?: string[];
  context?: string;
  confirmed?: boolean;
};

type ParaData = {
  projects: ParaElement[];
  areas: ParaElement[];
  resources: ParaElement[];
  archives: ParaElement[];
};

interface Props {
  paraData: ParaData;
  onConfirmElement: (element: ParaElement) => void;
  onRejectElement: (elementId: string) => void;
  isExtracting: boolean;
}

const typeIcons = {
  project: Target,
  area: Folder,
  resource: BookOpen,
  archive: Archive,
};

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

export default function ParaSidebar({ 
  paraData, 
  onConfirmElement, 
  onRejectElement, 
  isExtracting 
}: Props) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['projects']));
  const [confirmingElements, setConfirmingElements] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const renderElement = (element: ParaElement) => {
    const Icon = typeIcons[element.type];
    
    return (
      <div 
        key={element.id}
        className={`p-3 border rounded-lg mb-2 ${
          element.confirmed 
            ? 'bg-green-50 border-green-200' 
            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-sm">{element.title}</span>
              {element.confirmed && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
            </div>
            
            {element.description && (
              <p className="text-xs text-gray-600 mb-2">{element.description}</p>
            )}
            
            <div className="flex flex-wrap gap-1 mb-2">
              {element.priority && (
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${priorityColors[element.priority]}`}
                >
                  {element.priority}
                </Badge>
              )}
              {element.dueDate && (
                <Badge variant="outline" className="text-xs">
                  Due: {new Date(element.dueDate).toLocaleDateString()}
                </Badge>
              )}
              {element.tags?.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            {element.context && (
              <p className="text-xs text-gray-500 italic">{element.context}</p>
            )}
          </div>
        </div>
        
        {!element.confirmed && (
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                setConfirmingElements(prev => new Set(prev).add(element.id));
                await onConfirmElement(element);
                setConfirmingElements(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(element.id);
                  return newSet;
                });
              }}
              disabled={confirmingElements.has(element.id)}
              className="text-xs"
            >
              {confirmingElements.has(element.id) ? 'Saving...' : 'Confirm'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRejectElement(element.id)}
              className="text-xs text-gray-500"
            >
              Reject
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (
    title: string, 
    elements: ParaElement[], 
    sectionKey: string,
    Icon: React.ComponentType<{ className?: string }>
  ) => {
    const isExpanded = expandedSections.has(sectionKey);
    const unconfirmedCount = elements.filter(el => !el.confirmed).length;
    
    return (
      <div key={sectionKey} className="mb-4">
        <Button
          variant="ghost"
          onClick={() => toggleSection(sectionKey)}
          className="w-full justify-between p-2 h-auto"
        >
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            <span className="font-medium">{title}</span>
            <Badge variant="secondary" className="text-xs">
              {elements.length}
            </Badge>
            {unconfirmedCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unconfirmedCount} new
              </Badge>
            )}
          </div>
          <Circle className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </Button>
        
        {isExpanded && (
          <div className="mt-2 pl-2">
            {elements.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No {title.toLowerCase()} detected</p>
            ) : (
              elements.map(renderElement)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-80 h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          PARA Framework
          {isExtracting && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4">
        {renderSection('Projects', paraData.projects, 'projects', Target)}
        {renderSection('Areas', paraData.areas, 'areas', Folder)}
        {renderSection('Resources', paraData.resources, 'resources', BookOpen)}
        {renderSection('Archives', paraData.archives, 'archives', Archive)}
        
        {isExtracting && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">Analyzing conversation for PARA elements...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}