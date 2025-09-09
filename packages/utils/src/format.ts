export function formatCurrency(amountCents: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amountCents / 100);
}

export function formatDate(date: Date | string | number, locale = 'en-GB'): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString(locale);
}
