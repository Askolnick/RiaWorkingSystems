"use client";
import Link from 'next/link';
import { ROUTES } from '@ria/utils';

/**
 * CourseCard renders a card for a course with title, level, summary and tags. When clicked
 * it navigates to the course details page. The level and status are shown as small badges.
 */
export default function CourseCard({ c }: { c: any }) {
  return (
    <Link
      href={`${ROUTES.LIBRARY_LEARNING}/c/${c.id}`}
      className="border rounded p-3 hover:bg-gray-50 block"
    >
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase bg-gray-100 px-2 py-1 rounded">
          {c.level || 'beginner'}
        </span>
        <strong>{c.title}</strong>
        <span className="ml-auto text-xs opacity-70">{c.status || 'draft'}</span>
      </div>
      {c.summary && <div className="text-sm opacity-80 mt-1">{c.summary}</div>}
      <div className="mt-1 space-x-1">
        {(c.tags || []).map((t: string) => (
          <span
            key={t}
            className="inline-block text-xs bg-gray-100 px-2 py-1 rounded"
          >
            {t}
          </span>
        ))}
      </div>
    </Link>
  );
}
