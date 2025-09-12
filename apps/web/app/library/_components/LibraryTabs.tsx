"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@ria/utils';

/**
 * LibraryTabs shows tabs for the Library hub (Wiki, Learning, Uploads). It highlights
 * the current section based on the pathname. This component is UI-only and can
 * be used across all Library pages.
 */
export default function LibraryTabs() {
  const pathname = usePathname();
  const tabs = [
    { href: ROUTES.LIBRARY_WIKI, label: 'Wiki' },
    { href: ROUTES.LIBRARY_LEARNING, label: 'Learning' },
    { href: ROUTES.LIBRARY_UPLOADS, label: 'Uploads' },
    { href: ROUTES.LIBRARY_SECTIONS, label: 'Sections' },
  ];
  return (
    <nav className="border-b mb-3">
      <ul className="flex gap-2 p-1">
        {tabs.map((t) => {
          const active = pathname?.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className={`px-3 py-2 rounded-t-md ${active ? 'bg-white border border-b-white -mb-px' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
