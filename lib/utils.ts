export function genererUid(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2, 7);
}

export function formatFCFA(amount: number): string {
  return amount.toLocaleString('fr-FR') + ' FCFA';
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}
