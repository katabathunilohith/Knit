export const COLLAB_COLORS = [
  '#3b82f6', // Sapphire Blue
  '#10b981', // Emerald Green
  '#f59e0b', // Amber
  '#ec4899', // Rose Pink
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#6366f1', // Indigo
  '#d946ef', // Fuchsia
];

export const FUN_NAMES = [
  'Ada Lovelace',
  'Leslie Lamport',
  'Barbara Liskov',
  'Alan Turing',
  'Claude Shannon',
  'Grace Hopper',
  'John von Neumann',
  'Margaret Hamilton',
  'Ken Thompson',
  'Donald Knuth',
];

export function getRandomColor(): string {
  return COLLAB_COLORS[Math.floor(Math.random() * COLLAB_COLORS.length)];
}

export function getRandomName(): string {
  return FUN_NAMES[Math.floor(Math.random() * FUN_NAMES.length)];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
