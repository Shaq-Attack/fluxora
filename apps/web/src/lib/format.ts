export function formatPrice(value: number | undefined): string {
  if (value === undefined) return '—';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
