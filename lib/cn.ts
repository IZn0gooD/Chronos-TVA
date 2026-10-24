type ClassValue = string | number | false | null | undefined;

/** Joins class names, dropping the falsy ones. No merging: keep utilities non-conflicting. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
