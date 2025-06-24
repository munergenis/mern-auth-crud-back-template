/**
 *
 * TIME FROM NOW
 *
 */
export const daysFromNow = (days: number): Date => {
  if (days < 0) {
    throw new Error('days must be greater than 0');
  }
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};
export const hoursFromNow = (hours: number): Date => {
  if (hours < 0) {
    throw new Error('hours must be greater than 0');
  }
  return new Date(Date.now() + hours * 60 * 60 * 1000);
};
export const minutesFromNow = (minutes: number): Date => {
  if (minutes < 0) {
    throw new Error('minutes must be greater than 0');
  }
  return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 *
 * TIME AGO
 *
 */
export const minutesAgo = (minutes: number): Date => {
  if (minutes < 0) {
    throw new Error('minutes must be greater than 0');
  }
  return new Date(Date.now() - minutes * 60 * 1000);
};

/**
 *
 * TIME IN MS
 *
 */
export const hoursInMs = (hours: number): number => {
  if (hours < 0) {
    throw new Error('hours must be greater than 0');
  }
  return hours * 60 * 60 * 1000;
};
