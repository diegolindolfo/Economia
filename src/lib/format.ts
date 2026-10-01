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

/** Parses common Brazilian and international currency input formats. */
export function parseLocalizedAmount(input: string): number | null {
  let value = input.trim().replace(/^R\$\s*/i, '').replace(/\s+/g, '');
  if (!value) return null;

  let sign = 1;
  if (value.startsWith('-') || value.startsWith('+')) {
    if (value[0] === '-') sign = -1;
    value = value.slice(1);
  }
  if (!value || !/^[\d.,]+$/.test(value)) return null;

  const comma = value.lastIndexOf(',');
  const dot = value.lastIndexOf('.');
  let integerPart = value;
  let fractionPart = '';

  if (comma >= 0 && dot >= 0) {
    const decimalSeparator = comma > dot ? ',' : '.';
    const groupingSeparator = decimalSeparator === ',' ? '.' : ',';
    const decimalIndex = value.lastIndexOf(decimalSeparator);
    integerPart = value.slice(0, decimalIndex);
    fractionPart = value.slice(decimalIndex + 1);
    const groups = integerPart.split(groupingSeparator);
    if (
      groups.length > 1 &&
      (!/^\d{1,3}$/.test(groups[0]) || groups.slice(1).some((group) => !/^\d{3}$/.test(group)))
    ) {
      return null;
    }
    integerPart = groups.join('');
  } else if (comma >= 0 || dot >= 0) {
    const separator = comma >= 0 ? ',' : '.';
    const pieces = value.split(separator);
    if (pieces.some((piece) => piece === '')) return null;

    if (pieces.length > 2) {
      if (pieces[0].length < 1 || pieces[0].length > 3 || pieces.slice(1).some((piece) => piece.length !== 3)) {
        return null;
      }
      integerPart = pieces.join('');
    } else {
      const [left, right] = pieces;
      if (right.length === 3 && left.length <= 3) {
        integerPart = left + right;
      } else {
        integerPart = left;
        fractionPart = right;
      }
    }
  }

  if (!/^\d+$/.test(integerPart) || (fractionPart && !/^\d{1,2}$/.test(fractionPart))) {
    return null;
  }

  const amount = Number(`${integerPart}${fractionPart ? `.${fractionPart}` : ''}`);
  return Number.isFinite(amount) ? sign * amount : null;
}

/** True only for a real calendar date written as YYYY-MM-DD. */
export function isValidISODate(value: string): boolean {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
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
