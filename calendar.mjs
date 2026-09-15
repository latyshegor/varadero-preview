// Date-range calendar helpers. Pure functions, no DOM. Dates are ISO strings YYYY-MM-DD.
const DAY = 86400000;

export function iso(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function addMonths(year, month, delta) {
  const total = year * 12 + month + delta;
  return [Math.floor(total / 12), ((total % 12) + 12) % 12];
}

// Cells of one month, Monday first: leading blanks as null, then ISO dates.
export function monthCells(year, month) {
  const lead = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => iso(year, month, i + 1))];
}

// Selection reducer: first click sets arrival, second (later) click sets departure.
export function pickDate({ arrival, departure, mode }, day) {
  if (mode !== 'departure' || !arrival || day <= arrival) return { arrival: day, departure: '', mode: 'departure' };
  return { arrival, departure: day, mode: 'done' };
}

export function nights(arrival, departure) {
  if (!arrival || !departure) return 0;
  return Math.round((Date.parse(departure) - Date.parse(arrival)) / DAY);
}
