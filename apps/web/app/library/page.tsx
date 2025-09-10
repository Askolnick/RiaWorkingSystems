import LibraryTabs from './_components/LibraryTabs';

export default function LibraryCenter() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Library</h1>
      <LibraryTabs />
      <div className="mt-6">
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Welcome to your unified library for documents, learning materials, and file storage.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">📚 Wiki</h3>
            <p className="text-sm text-gray-600">
              Create and organize documentation, policies, and knowledge articles.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">🎓 Learning</h3>
            <p className="text-sm text-gray-600">
              Manage courses, lessons, and training materials with built-in quiz builder.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">📁 Uploads</h3>
            <p className="text-sm text-gray-600">
              Store and organize files with folder-based organization and attachment management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}