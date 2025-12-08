import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Severity, IncidentType } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case 'Low':
      return 'bg-green-50 border-green-200 text-green-800';
    case 'Medium':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    case 'High':
      return 'bg-red-50 border-red-200 text-red-800';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800';
  }
}

export function getSeverityColorClass(severity: Severity): string {
  switch (severity) {
    case 'Low':
      return 'text-green-600 bg-green-100';
    case 'Medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'High':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getIncidentTypeIcon(type: IncidentType): string {
  switch (type) {
    case 'Server Down':
      return 'SERVER';
    case 'Network Issue':
      return 'NETWORK';
    case 'UI Bug':
      return 'UI';
    case 'Customer Complaint':
      return 'SUPPORT';
    case 'Database Error':
      return 'DATABASE';
    case 'Security Breach':
      return 'SECURITY';
    case 'Performance Issue':
      return 'PERFORMANCE';
    case 'Integration Failure':
      return 'INTEGRATION';
    default:
      return 'OTHER';
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function estimateReadingTime(text: string): string {
  const wordsPerMinute = 200;
  const words = text.split(' ').length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

export function calculateCompletionTime(steps: any[]): string {
  // Simulate completion time based on number of steps
  const baseTime = 5; // 5 minutes base
  const perStepTime = 2; // 2 minutes per step
  const totalMinutes = baseTime + (steps.length * perStepTime);
  
  if (totalMinutes < 60) {
    return `${totalMinutes} minutes`;
  } else {
    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    return remainingMinutes > 0 
      ? `${hours}h ${remainingMinutes}m` 
      : `${hours} hour${hours > 1 ? 's' : ''}`;
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
