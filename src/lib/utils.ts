import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatName(name: string) {
  if (!name) return "Unknown";
  const lowerName = name.toLowerCase();
  
  // Specific Nicknames Cleanup
  if (lowerName.includes('nullified')) return "Null";
  if (lowerName.includes('yun') || lowerName.includes('vanessa')) return "Yun";
  
  // Generic Cleanup: Remove special chars and take first part
  const cleanName = name.split(/_|(?=[A-Z])| /)[0];
  return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
}
