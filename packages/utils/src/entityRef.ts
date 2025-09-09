export function toRef(type: string, id: string): string {
  return `${type}:${id}`;
}

export function parseRef(ref: string): { type: string; id: string } {
  const idx = ref.indexOf(':');
  return { type: ref.slice(0, idx), id: ref.slice(idx + 1) };
}
