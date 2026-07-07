import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind CSS classes intelligently, resolving conflicts
 * (e.g. `px-2 px-4` -> `px-4`) while preserving conditional class logic.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
