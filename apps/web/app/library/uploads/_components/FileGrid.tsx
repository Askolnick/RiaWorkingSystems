"use client";

/**
 * FileGrid renders a card grid for files in the Uploads section. Each card shows
 * the file name, type, size, modification date and provides actions.
 */

const getFileIcon = (type: string) => {
  switch(type) {
    case 'pdf': return '📄';
    case 'image': return '🖼️';
    case 'video': return '🎥';
    case 'spreadsheet': return '📊';
    case 'presentation': return '📽️';
    case 'document': return '📝';
    case 'design': return '🎨';
    default: return '📎';
  }
};

export default function FileGrid({ files }: { files: any[] }) {
  if (!files?.length) return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📁</div>
      <p className="text-gray-500 mb-4">No files uploaded yet</p>
      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Upload Your First File
      </button>
    </div>
  );
  
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((f) => (
        <div key={f.id} className="border rounded-lg hover:shadow-lg transition-shadow bg-white">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{getFileIcon(f.type)}</span>
              <details className="relative">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700">⋮</summary>
                <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                  <button className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm">Download</button>
                  <button className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm">Share</button>
                  <button className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm">Rename</button>
                  <button className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm text-red-600">Delete</button>
                </div>
              </details>
            </div>
            
            <h3 className="font-medium text-gray-900 truncate mb-1" title={f.name}>
              {f.name}
            </h3>
            
            <div className="text-xs text-gray-500 space-y-1">
              <div>{f.size}</div>
              <div>Modified: {f.modified}</div>
            </div>
            
            {f.folder && (
              <div className="mt-2">
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  📁 {f.folder}
                </span>
              </div>
            )}
          </div>
          
          <div className="border-t px-4 py-2 bg-gray-50">
            <button className="text-blue-600 hover:underline text-sm font-medium">
              View Details →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
