import { format, startOfMonth, isValid, isBefore, startOfDay, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Returns a greeting based on the current time.
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * Returns the first day of the month formatted as yyyy-MM-dd.
 */
export function getFirstDayOfMonth(date: Date = new Date()): string {
  return format(startOfMonth(date), 'yyyy-MM-dd');
}

/**
 * Formats a date to dd/MM/yyyy.
 */
export function formatDateBR(date: string | Date): string {
  const d = new Date(date);
  if (!isValid(d)) return '';
  return format(d, 'dd/MM/yyyy');
}

/**
 * Formats a date to Month Year (e.g., Outubro 2026).
 */
export function formatMonthYear(date: string | Date): string {
  const d = new Date(date);
  if (!isValid(d)) return '';
  const formatted = format(d, 'MMMM yyyy', { locale: ptBR });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Calculates actual due date handling months with fewer days.
 * Returns yyyy-MM-dd
 */
export function getDueDate(year: number, month: number, dueDay: number): string {
  // month is 0-indexed in JS Date
  const d = new Date(year, month, dueDay);
  // If the month overflowed because of fewer days, the month will be different
  if (d.getMonth() !== month) {
    // Return last day of the desired month
    return format(new Date(year, month + 1, 0), 'yyyy-MM-dd');
  }
  return format(d, 'yyyy-MM-dd');
}

/**
 * Checks if date is before today.
 */
export function isOverdue(dueDate: string | Date): boolean {
  const today = startOfDay(new Date());
  const due = startOfDay(new Date(dueDate));
  return isBefore(due, today);
}

/**
 * Returns number of days until due date.
 * If negative, it's overdue.
 */
export function getDaysUntil(dueDate: string | Date): number {
  const today = startOfDay(new Date());
  const due = startOfDay(new Date(dueDate));
  return differenceInDays(due, today);
}
