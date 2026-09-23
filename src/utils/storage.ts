import { Expense } from '../types.ts';
import { storeReceiptPhoto, getReceiptPhoto } from './imageDb.ts';

export const STORAGE_EXPENSES_KEY = 'mis_gastos_expenses_v1';
export const STORAGE_SAVINGS_KEY = 'mis_gastos_savings_v1';
export const STORAGE_CURRENCY_KEY = 'mis_gastos_currency_v1';

/**
 * Sanitizes expenses before storing in localStorage:
 * Offloads any large photo data URLs to IndexedDB to avoid QuotaExceededError.
 */
export function sanitizeExpensesForLocalStorage(expenses: Expense[]): Expense[] {
  return expenses.map((exp) => {
    let sanitizedExp = { ...exp };

    // Check if expense has an inline photo in receiptUrl
    if (exp.receiptUrl && exp.receiptUrl.startsWith('data:image')) {
      const photoKey = `photo_${exp.id}`;
      // Store in IndexedDB in background
      storeReceiptPhoto(photoKey, exp.receiptUrl).catch(console.warn);
      sanitizedExp.receiptUrl = `idb:${photoKey}`;
    }

    // Check if virtualReceipt has an inline realPhotoUrl
    if (exp.virtualReceipt && exp.virtualReceipt.realPhotoUrl && exp.virtualReceipt.realPhotoUrl.startsWith('data:image')) {
      const photoKey = `photo_${exp.virtualReceipt.id || exp.id}`;
      storeReceiptPhoto(photoKey, exp.virtualReceipt.realPhotoUrl).catch(console.warn);
      sanitizedExp.virtualReceipt = {
        ...exp.virtualReceipt,
        realPhotoUrl: `idb:${photoKey}`,
      };
    }

    return sanitizedExp;
  });
}

/**
 * Safely saves expenses to localStorage without exceeding quota.
 */
export function safeSaveExpenses(expenses: Expense[]): void {
  try {
    const sanitized = sanitizeExpensesForLocalStorage(expenses);
    const jsonStr = JSON.stringify(sanitized);
    localStorage.setItem(STORAGE_EXPENSES_KEY, jsonStr);
  } catch (err: any) {
    console.warn('First attempt to save expenses failed, attempting cleanup:', err);
    try {
      // Emergency strip of any URLs in case quota is extremely constrained
      const stripped = expenses.map((e) => ({
        ...e,
        receiptUrl: undefined,
        virtualReceipt: e.virtualReceipt
          ? { ...e.virtualReceipt, realPhotoUrl: undefined }
          : undefined,
      }));
      localStorage.setItem(STORAGE_EXPENSES_KEY, JSON.stringify(stripped));
    } catch (criticalErr) {
      console.error('Critical quota error saving to localStorage:', criticalErr);
    }
  }
}

/**
 * Safely loads expenses from localStorage.
 */
export function safeLoadExpenses(fallbackExpenses: Expense[]): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_EXPENSES_KEY);
    if (!raw) return fallbackExpenses;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return fallbackExpenses;

    // Check if previously saved version had bulky data URLs clogging localStorage
    const hasBulkyImages = parsed.some(
      (exp: Expense) =>
        (exp.receiptUrl && exp.receiptUrl.startsWith('data:image')) ||
        (exp.virtualReceipt?.realPhotoUrl && exp.virtualReceipt.realPhotoUrl.startsWith('data:image'))
    );

    if (hasBulkyImages) {
      // Clean up localStorage immediately to reclaim browser storage quota!
      setTimeout(() => {
        safeSaveExpenses(parsed);
      }, 100);
    }

    return parsed;
  } catch (err) {
    console.warn('Failed to parse expenses from localStorage, using initial data:', err);
    return fallbackExpenses;
  }
}

/**
 * Resolves a photo URL that might be an IndexedDB reference ('idb:photo_xxx')
 */
export async function resolvePhotoUrl(url?: string): Promise<string | undefined> {
  if (!url) return undefined;
  if (url.startsWith('idb:')) {
    const key = url.replace('idb:', '');
    const photo = await getReceiptPhoto(key);
    return photo || undefined;
  }
  return url;
}
