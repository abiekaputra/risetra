export function createSourceId(): string {
  return `SRC-${Date.now().toString(36).toUpperCase()}`;
}
