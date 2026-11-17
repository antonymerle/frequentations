export interface AttendanceSlot {
  minute: number;
  entries: number;
  exits: number;
}

export interface AttendanceDay {
  weekday: number;
  slots: AttendanceSlot[];
}

export interface OccupancyPoint {
  label: string;
  rate: number | null;
  days: number;
  period: string;
}

// Every point covers the same duration: weight by the number of observed days.
export function annualOccupancy(points: OccupancyPoint[]): number | null {
  const observed = points.filter(point => point.rate !== null);
  const count = observed.reduce((sum, point) => sum + point.days, 0);
  return count ? observed.reduce((sum, point) => sum + (point.rate ?? 0) * point.days, 0) / count : null;
}

// Half-hour counts describe flows, not seated users. Estimate the average
// presence within each interval from the midpoint of its opening/closing stock.
export function calculateOccupancy(
  days: Record<string, AttendanceDay>,
  site: 'bayonne' | 'pau',
  mode: 'evening' | 'saturday'
): OccupancyPoint[] {
  const capacity = site === 'bayonne' ? 196 : 840;
  const periods = mode === 'evening'
    ? [{ start: 1080, end: 1320, name: 'Soirée' }]
    : site === 'bayonne'
      ? [{ start: 540, end: 780, name: 'Matin' }]
      : [{ start: 570, end: 780, name: 'Matin' }, { start: 780, end: 990, name: 'Après-midi' }];
  const prepared = Object.values(days).filter(day => mode === 'saturday'
    ? day.weekday === 6
    : day.weekday >= 1 && day.weekday <= (site === 'bayonne' ? 3 : 5)
  ).map(day => {
    let stock = 0;
    const samples = new Map<number, number>();
    const slots = [...day.slots].sort((a, b) => a.minute - b.minute);
    for (const slot of slots) {
      const next = Math.max(0, stock + slot.entries - slot.exits);
      samples.set(slot.minute, (stock + next) / 2);
      stock = next;
    }
    return { slots, samples };
  });
  const time = (minute: number) => `${Math.floor(minute / 60).toString().padStart(2, '0')}:${(minute % 60).toString().padStart(2, '0')}`;
  return periods.flatMap(period => {
    const openDays = prepared.filter(day => {
      const slots = day.slots.filter(slot => slot.minute >= period.start && slot.minute < period.end);
      const entries = slots.reduce((sum, slot) => sum + slot.entries, 0);
      const exits = slots.reduce((sum, slot) => sum + slot.exits, 0);
      // Saturday's >5-entry threshold is evaluated over the whole opening period.
      const saturdayEntries = day.slots.filter(slot => slot.minute >= periods[0].start && slot.minute < periods[periods.length - 1].end)
        .reduce((sum, slot) => sum + slot.entries, 0);
      return entries + exits > 0 && (mode !== 'saturday' || saturdayEntries > 5);
    });
    const result: OccupancyPoint[] = [];
    for (let start = period.start; start < period.end;) {
      const end = start + 30;
      const values: number[] = [];
      for (const day of openDays) {
        const sample = day.samples.get(start);
        // Missing observations are unavailable, not zero attendance.
        if (sample !== undefined) values.push(sample);
      }
      const rate = values.length ? values.reduce((a, b) => a + b, 0) / values.length / capacity * 100 : null;
      result.push({ label: `${time(start)}–${time(end)}`, rate, days: values.length, period: period.name });
      start = end;
    }
    return result;
  });
}
