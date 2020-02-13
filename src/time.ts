/**
 * Allows trivial and type-checked conversion between units of time. For example:
 * ```
 * const hoursToDays = hours(36).in('days'); // 1.5
 * const minutesToMs = minutes(15).in('milliseconds'); // 900000
 * const oneYear = milliseconds(days(365).in('milliseconds')).in('years'); // 1
 * ```
 */
export const timeProcessor = 'Just here for the JS Docs';

type N = number;
type TimeUnit = 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'years';

const t = new Map<TimeUnit, number>();
const get = key => t.get(key)!;

const numberOfMillisecondsIn = t
  .set('milliseconds', 1)
  .set('seconds', 1_000 * get('milliseconds'))
  .set('minutes', 60 * get('seconds'))
  .set('hours', 60 * get('minutes'))
  .set('days', 24 * get('hours'))
  .set('weeks', 7 * get('days'))
  .set('years', 365 * get('days'));

function getConverter(numUnits: N, unit: TimeUnit): { in: (unit: TimeUnit) => N; ms: N } {
  const milliseconds = numUnits * numberOfMillisecondsIn.get(unit)!;

  return {
    in(unit: TimeUnit) {
      return milliseconds / numberOfMillisecondsIn.get(unit)!;
    },

    ms: milliseconds,
  };
}

export const milliseconds = (numUnits: N) => getConverter(numUnits, 'milliseconds');
export const seconds = (numUnits: N) => getConverter(numUnits, 'seconds');
export const minutes = (numUnits: N) => getConverter(numUnits, 'minutes');
export const hours = (numUnits: N) => getConverter(numUnits, 'hours');
export const days = (numUnits: N) => getConverter(numUnits, 'days');
export const weeks = (numUnits: N) => getConverter(numUnits, 'weeks');
export const years = (numUnits: N) => getConverter(numUnits, 'years');
