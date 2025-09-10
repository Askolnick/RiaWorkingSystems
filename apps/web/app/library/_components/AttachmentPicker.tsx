"use client";
import { useEffect, useState } from 'react';
import { createMockFiles } from '@ria/files-client';

const filesApi = createMockFiles();

/**
 * AttachmentPicker displays a searchable list of files and returns the selected file
 * via the onSelect callback. It uses the mock Files API for now but can be
 * switched to a real API later. Useful for picking attachments when editing
 * documents or lessons.
 */
export default function AttachmentPicker({ onSelect }: { onSelect: (file: any) => void }) {
  const [q, setQ] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  useEffect(() => {
    filesApi.list().then(setFiles);
  }, []);
  const filtered = files.filter((f) => !q || f.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="grid gap-2">
      <input
        className="border rounded p-2"
        placeholder="Search files…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="grid gap-2">
        {filtered.map((f) => (
          <button
            key={f.id}
            className="text-left border rounded p-2 hover:bg-gray-50"
            onClick={() => onSelect(f)}
          >
            <div className="flex items-center gap-2">
              <strong>{f.name}</strong>
              <span className="text-xs opacity-70 ml-auto">{f.type}</span>
            </div>
            <div className="text-xs opacity-80 break-all">{f.url}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
