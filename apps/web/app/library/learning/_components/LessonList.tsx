"use client";
import Link from 'next/link';

/**
 * LessonList renders a simple list of lessons with links. If no lessons exist, it
 * displays a placeholder message. This component can be reused across course
 * detail screens.
 */
export default function LessonList({ lessons }: { lessons: any[] }) {
  if (!lessons?.length) return <div className="text-sm text-gray-500">No lessons yet.</div>;
  return (
    <div className="grid gap-2">
      {lessons.map((l) => (
        <Link
          key={l.id}
          href={`/portal/library/learning/l/${l.id}`}
          className="border rounded p-2 hover:bg-gray-50"
        >
          {l.title}
        </Link>
      ))}
    </div>
  );
}
