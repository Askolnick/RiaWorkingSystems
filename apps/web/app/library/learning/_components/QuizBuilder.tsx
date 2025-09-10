"use client";
import { useState } from 'react';

/**
 * QuizBuilder is a skeleton component for building quizzes. It lets users add
 * multiple choice, single choice and free text questions. The component is
 * UI-only; currently it manages state locally but can be wired to
 * persistent data later.
 */
type Q = {
  id: string;
  type: 'mc' | 'single' | 'free-text';
  prompt: string;
  options?: string[];
  answer?: any;
};

export default function QuizBuilder() {
  const [items, setItems] = useState<Q[]>([]);
  const add = (t: Q['type']) =>
    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        type: t,
        prompt: '',
        options: t !== 'free-text' ? [''] : undefined,
      },
    ]);
  const update = (id: string, patch: Partial<Q>) =>
    setItems((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  const remove = (id: string) => setItems((prev) => prev.filter((q) => q.id !== id));
  return (
    <div className="grid gap-3">
      <div className="flex gap-2">
        <button className="px-2 py-1 text-sm border rounded" onClick={() => add('mc')}>
          + Multiple Choice
        </button>
        <button className="px-2 py-1 text-sm border rounded" onClick={() => add('single')}>
          + Single Choice
        </button>
        <button className="px-2 py-1 text-sm border rounded" onClick={() => add('free-text')}>
          + Free Text
        </button>
      </div>
      <div className="grid gap-3">
        {items.map((q, ix) => (
          <div key={q.id} className="border rounded p-3 grid gap-2">
            <div className="text-xs opacity-70">
              Q{ix + 1} • {q.type}
            </div>
            <input
              className="border rounded p-2"
              placeholder="Question prompt…"
              value={q.prompt}
              onChange={(e) => update(q.id, { prompt: e.target.value })}
            />
            {q.type !== 'free-text' && (
              <div className="grid gap-2">
                {(q.options || []).map((opt, oi) => (
                  <div key={oi} className="flex gap-2">
                    <input
                      className="border rounded p-2 flex-1"
                      placeholder={`Option ${oi + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const next = [...(q.options || [])];
                        next[oi] = e.target.value;
                        update(q.id, { options: next });
                      }}
                    />
                    <button
                      className="px-2 py-1 border rounded"
                      onClick={() => {
                        const next = (q.options || []).filter((_, i) => i !== oi);
                        update(q.id, { options: next });
                      }}
                    >
                      −
                    </button>
                  </div>
                ))}
                <button
                  className="px-2 py-1 text-sm border rounded"
                  onClick={() => update(q.id, { options: [...(q.options || []), ''] })}
                >
                  + Option
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <button className="px-2 py-1 border rounded" onClick={() => remove(q.id)}>
                Delete
              </button>
              <span className="text-xs opacity-70">Draft (UI-only; wire to API later)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
