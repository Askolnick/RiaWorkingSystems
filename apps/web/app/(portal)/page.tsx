import Link from 'next/link';

export default function PortalHome() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Portal</h1>
      <p className="text-gray-700 dark:text-gray-300">
        Welcome to the portal.  Choose a centre to begin:
      </p>
      <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
        <li><Link href="./messaging" className="text-blue-600 dark:text-blue-400 hover:underline">Messaging</Link></li>
        <li><Link href="./tasks" className="text-blue-600 dark:text-blue-400 hover:underline">Tasks</Link></li>
        <li><Link href="./library" className="text-blue-600 dark:text-blue-400 hover:underline">Library</Link></li>
        <li><Link href="./insights" className="text-blue-600 dark:text-blue-400 hover:underline">Insights</Link></li>
        <li><Link href="./finance" className="text-blue-600 dark:text-blue-400 hover:underline">Finance</Link></li>
        <li><Link href="./product" className="text-blue-600 dark:text-blue-400 hover:underline">Product</Link></li>
        <li><Link href="./campaigns" className="text-blue-600 dark:text-blue-400 hover:underline">Campaigns</Link></li>
        <li><Link href="./admin" className="text-blue-600 dark:text-blue-400 hover:underline">Admin</Link></li>
        <li><Link href="./settings" className="text-blue-600 dark:text-blue-400 hover:underline">Settings</Link></li>
      </ul>
    </div>
  );
}