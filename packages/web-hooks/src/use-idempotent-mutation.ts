import { useRef } from 'react';

export function useIdempotentMutation<TArgs extends any[], TResult>(fn: (...args: TArgs) => Promise<TResult>) {
  const keyRef = useRef<string>('');
  async function mutate(...args: TArgs): Promise<TResult> {
    keyRef.current = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    return await fn(...args);
  }
  return { mutate, lastKey: keyRef.current };
}
