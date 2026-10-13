/** Saved-item keys. Plain module (no "use client") so server components can build keys too. */
export function workoutKey(id: string): string {
  return `workout:${id}`;
}

export function postKey(id: string): string {
  return `post:${id}`;
}
