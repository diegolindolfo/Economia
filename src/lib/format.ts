/**
 * Helper utilities for formatting currencies, dates, and amounts
 */

export function formatCurrency(value: number, showSign = false): string {
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  
  const formatted = absValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (showSign) {
    if (value > 0) return `+${formatted}`;
    if (value < 0) return `-${formatted}`;
  } else if (isNegative) {
    return `-${formatted}`;
  }
  
  return formatted;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1).replace('.', ',')}%`;
}

export function formatDateBR(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoDate;
}

export function formatShortDate(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    const day = parts[2];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthIndex = parseInt(parts[1], 10) - 1;
    return `${day} ${months[monthIndex] || parts[1]}`;
  }
  return isoDate;
}

export function formatMonthYear(yearMonth: string): string {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-');
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const monthIdx = parseInt(month, 10) - 1;
  const monthName = months[monthIdx] || month;
  return `${monthName} de ${year}`;
}

export function formatShortMonth(yearMonth: string): string {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthIdx = parseInt(month, 10) - 1;
  return `${months[monthIdx] || month}/${year.slice(2)}`;
}

export function getRelativeDayLabel(isoDate: string): string {
  if (!isoDate) return '';
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  
  if (isoDate === today) return 'Hoje';
  if (isoDate === yesterday) return 'Ontem';

  const parts = isoDate.split('-');
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const weekDays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${weekDays[d.getDay()]}, ${parts[2]} de ${months[d.getMonth()]}`;
  }
  return formatDateBR(isoDate);
}
