"use client";
import { useState } from 'react';

/**
 * FolderSidebar shows a hierarchical folder structure for the Uploads section.
 * Enhanced with icons, file counts, and better visual organization.
 */

interface Folder {
  id: string;
  name: string;
  icon: string;
  count: number;
  children?: Folder[];
}

export default function FolderSidebar() {
  const [selected, setSelected] = useState('all');
  const [expanded, setExpanded] = useState<string[]>(['shared']);
  
  const folders: Folder[] = [
    { id: 'all', name: 'All Files', icon: '🗂️', count: 156 },
    { id: 'recent', name: 'Recent', icon: '🕐', count: 12 },
    { id: 'starred', name: 'Starred', icon: '⭐', count: 8 },
    { 
      id: 'shared', 
      name: 'Shared', 
      icon: '👥', 
      count: 45,
      children: [
        { id: 'team', name: 'Team Files', icon: '👫', count: 23 },
        { id: 'client', name: 'Client Shared', icon: '🤝', count: 22 },
      ]
    },
    { id: 'documents', name: 'Documents', icon: '📄', count: 67 },
    { id: 'images', name: 'Images', icon: '🖼️', count: 34 },
    { id: 'videos', name: 'Videos', icon: '🎥', count: 12 },
    { id: 'templates', name: 'Templates', icon: '📋', count: 18 },
    { id: 'archive', name: 'Archive', icon: '📦', count: 89 },
    { id: 'trash', name: 'Trash', icon: '🗑️', count: 5 },
  ];

  const toggleExpand = (folderId: string) => {
    setExpanded(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const renderFolder = (folder: Folder, level = 0) => {
    const isExpanded = expanded.includes(folder.id);
    const hasChildren = folder.children && folder.children.length > 0;
    
    return (
      <div key={folder.id}>
        <div
          className={`w-full px-3 py-2 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors cursor-pointer ${
            selected === folder.id ? 'bg-blue-50 text-blue-600' : ''
          }`}
          style={{ paddingLeft: `${12 + level * 20}px` }}
          onClick={() => setSelected(folder.id)}
        >
          <div className="flex items-center gap-2">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(folder.id);
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            <span className="text-lg">{folder.icon}</span>
            <span className="text-sm font-medium">{folder.name}</span>
          </div>
          <span className="text-xs text-gray-500">{folder.count}</span>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {folder.children!.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="bg-white border rounded-lg p-4 h-fit">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">FOLDERS</h3>
        <div className="space-y-1">
          {folders.map(folder => renderFolder(folder))}
        </div>
      </div>
      
      <div className="border-t pt-4">
        <div className="text-xs text-gray-500 mb-2">Storage Used</div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '67%' }}></div>
        </div>
        <div className="text-xs text-gray-600 mt-1">6.7 GB of 10 GB</div>
      </div>
    </aside>
  );
}
