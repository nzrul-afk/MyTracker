import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge tailwind classes gracefully.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns the current date in YYYY-MM-DD format based on the local timezone.
 * Avoids the bug where toISOString() returns yesterday's date in morning hours.
 */
export function getLocalISODate(date: Date = new Date()): string {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
}

/**
 * Returns the current month in YYYY-MM format based on the local timezone.
 */
export function getLocalISOMonth(date: Date = new Date()): string {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 7);
}

/**
 * Returns the current time in HH:mm format based on the local timezone.
 */
export function getLocalISOTime(date: Date = new Date()): string {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[1].slice(0, 5);
}
