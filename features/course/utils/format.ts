export function formatDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${meters}m`;
}

export function formatCost(won: number): string {
  if (won >= 10000) return `${(won / 10000).toFixed(1)}만`;
  return `${won.toLocaleString()}원`;
}
