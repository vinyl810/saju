/**
 * Solar Terms (절기) Calculation for Korean Four Pillars (사주)
 *
 * Implements the Shouzheng (寿星/수성) formula for computing the dates
 * of the 12 "절" (Jeol) solar terms that define month boundaries in saju.
 *
 * Formula: day = [Y * D + C] - L + offset
 *   Y = year % 100
 *   D = 0.2422
 *   C = century-specific constant per term
 *   L = floor(Y / 4), but for 소한/대한/입춘/우수 in leap years, Y is decremented by 1
 *   offset = known correction for specific exceptional years
 *
 * Accuracy: within +/- 1 day for the range 1920-2100.
 *
 * References:
 *   - 寿星万年历 (Shouzheng Perpetual Calendar)
 *   - Purple Mountain Observatory solar term tables
 */

// ============================================================================
// Types
// ============================================================================

export interface SolarTermDate {
  /** Korean name of the solar term */
  name: string;
  /** Solar (Gregorian) month, 1-12 */
  month: number;
  /** Day of the month */
  day: number;
}

/**
 * Saju month info returned by findMonthByDate.
 * sajuMonth 1 = 인월 (Tiger month, starting at 입춘 around Feb 4)
 */
export interface SajuMonthInfo {
  /** Saju month number: 1 (인월) through 12 (축월) */
  sajuMonth: number;
  /** The 절 solar term that started this month */
  termName: string;
  /** Earthly branch (지지) of this month */
  earthlyBranch: string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * The 24 solar terms in order, starting from 소한 (index 0).
 * Even indices (0,2,4,...) are "절" (Jeol) terms that define month boundaries.
 * Odd indices (1,3,5,...) are "기" (Gi/Qi) terms (mid-month markers).
 *
 * Index:  0=소한  1=대한  2=입춘  3=우수  4=경칩  5=춘분
 *         6=청명  7=곡우  8=입하  9=소만  10=망종 11=하지
 *        12=소서 13=대서  14=입추 15=처서  16=백로 17=추분
 *        18=한로 19=상강  20=입동 21=소설  22=대설 23=동지
 */
const ALL_24_TERM_NAMES = [
  '소한', '대한', '입춘', '우수', '경칩', '춘분',
  '청명', '곡우', '입하', '소만', '망종', '하지',
  '소서', '대서', '입추', '처서', '백로', '추분',
  '한로', '상강', '입동', '소설', '대설', '동지',
] as const;

/**
 * The 12 "절" (Jeol) terms only -- these define saju month boundaries.
 * Ordered by calendar month (Jan through Dec).
 */
export const JEOL_NAMES = [
  '소한', // ~Jan 5-6   (Small Cold)          - 축월 (12th saju month)
  '입춘', // ~Feb 3-5   (Start of Spring)     - 인월 (1st saju month)
  '경칩', // ~Mar 5-7   (Awakening of Insects) - 묘월 (2nd)
  '청명', // ~Apr 4-6   (Clear and Bright)    - 진월 (3rd)
  '입하', // ~May 5-7   (Start of Summer)     - 사월 (4th)
  '망종', // ~Jun 5-7   (Grain in Ear)        - 오월 (5th)
  '소서', // ~Jul 6-8   (Small Heat)          - 미월 (6th)
  '입추', // ~Aug 7-9   (Start of Autumn)     - 신월 (7th)
  '백로', // ~Sep 7-9   (White Dew)           - 유월 (8th)
  '한로', // ~Oct 8-9   (Cold Dew)            - 술월 (9th)
  '입동', // ~Nov 7-8   (Start of Winter)     - 해월 (10th)
  '대설', // ~Dec 6-8   (Heavy Snow)          - 자월 (11th)
] as const;

/**
 * The indices of the 12 절 terms within the full 24-term array.
 * 소한=0, 입춘=2, 경칩=4, 청명=6, 입하=8, 망종=10,
 * 소서=12, 입추=14, 백로=16, 한로=18, 입동=20, 대설=22
 */
const JEOL_INDICES_IN_24 = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

/**
 * Solar ecliptic longitude (degrees) for each of the 12 절 terms.
 *   소한=285, 입춘=315, 경칩=345, 청명=15, 입하=45, 망종=75,
 *   소서=105, 입추=135, 백로=165, 한로=195, 입동=225, 대설=255
 */
export const JEOL_LONGITUDES = [285, 315, 345, 15, 45, 75, 105, 135, 165, 195, 225, 255];

/**
 * Gregorian month in which each 절 term falls (1-indexed).
 */
const JEOL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/**
 * Earthly branches for each saju month.
 * sajuMonth 1 (인월, starts 입춘) through 12 (축월, starts 소한).
 */
const SAJU_MONTH_BRANCHES = [
  '인', // 1  - 입춘 (Feb)
  '묘', // 2  - 경칩 (Mar)
  '진', // 3  - 청명 (Apr)
  '사', // 4  - 입하 (May)
  '오', // 5  - 망종 (Jun)
  '미', // 6  - 소서 (Jul)
  '신', // 7  - 입추 (Aug)
  '유', // 8  - 백로 (Sep)
  '술', // 9  - 한로 (Oct)
  '해', // 10 - 입동 (Nov)
  '자', // 11 - 대설 (Dec)
  '축', // 12 - 소한 (Jan)
] as const;

// ============================================================================
// Shouzheng Formula Coefficients
// ============================================================================

/** D constant: the fractional part of the tropical year in days (365.2422) */
const D = 0.2422;

/**
 * Century-specific C values for all 24 solar terms.
 *
 * Row 0 = 20th century (1900-2000)
 * Row 1 = 21st century (2001-2100)
 *
 * Column order follows the 24-term index:
 *   0=소한  1=대한  2=입춘  3=우수  4=경칩  5=춘분
 *   6=청명  7=곡우  8=입하  9=소만 10=망종 11=하지
 *  12=소서 13=대서 14=입추 15=처서 16=백로 17=추분
 *  18=한로 19=상강 20=입동 21=소설 22=대설 23=동지
 */
const CENTURY_C: readonly [readonly number[], readonly number[]] = [
  // 20th century (1900-2000)
  [
    6.11,    20.84,   4.6295, 19.4599, 6.3826, 21.4155,
    5.59,    20.888,  6.318,  21.86,   6.5,    22.2,
    7.928,   23.65,   8.35,   23.95,   8.44,   23.822,
    9.098,   24.218,  8.218,  23.08,   7.9,    22.6,
  ],
  // 21st century (2001-2100)
  [
    5.4055,  20.12,   3.87,   18.73,   5.63,   20.646,
    4.81,    20.1,    5.52,   21.04,   5.678,  21.37,
    7.108,   22.83,   7.5,    23.13,   7.646,  23.042,
    8.318,   23.438,  7.438,  22.36,   7.18,   21.94,
  ],
] as const;

/**
 * Known exception years where the formula result must be adjusted by +1 day.
 * Key = 24-term index, Value = array of years needing +1 correction.
 */
const INCREASE_OFFSET: Record<number, number[]> = {
  0:  [1982],         // 소한
  1:  [2082],         // 대한
  5:  [2084],         // 춘분
  9:  [2008],         // 소만
  10: [1902],         // 망종
  11: [1928],         // 하지
  12: [1925, 2016],   // 소서
  13: [1922],         // 대서
  14: [2002],         // 입추
  16: [1927],         // 백로
  17: [1942],         // 추분
  19: [2089],         // 상강
  20: [2089],         // 입동
  21: [1978],         // 소설
  22: [1954],         // 대설
};

/**
 * Known exception years where the formula result must be adjusted by -1 day.
 * Key = 24-term index, Value = array of years needing -1 correction.
 */
const DECREASE_OFFSET: Record<number, number[]> = {
  0:  [2019],         // 소한
  3:  [2026],         // 우수
  23: [1918, 2021],   // 동지
};

// ============================================================================
// Core Calculation Functions
// ============================================================================

/**
 * Compute the day-of-month for a given solar term in a given year
 * using the Shouzheng formula.
 *
 * @param year  - Gregorian year (1900-2100)
 * @param termIndex24 - Index within all 24 terms (0=소한 .. 23=동지)
 * @returns The day of the month (the month is implicitly known from termIndex24)
 * @throws Error if year is out of supported range
 */
function computeTermDay(year: number, termIndex24: number): number {
  if (year < 1900 || year > 2100) {
    throw new Error(
      `Year ${year} is out of supported range (1900-2100).`
    );
  }

  // Determine century index: 0 for 20th century, 1 for 21st century
  // Year 2000 is treated as 20th century (Y=100%100=0 with 20th-century C values)
  const centuryIndex = year <= 2000 ? 0 : 1;
  const C = CENTURY_C[centuryIndex][termIndex24];

  let Y = year % 100;

  // For leap years: if the term falls before March 1 (indices 0-3:
  // 소한, 대한, 입춘, 우수), decrement Y by 1 before computing L.
  // This accounts for the leap day not yet having occurred.
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  if (isLeapYear && termIndex24 <= 3) {
    Y = Y - 1;
  }

  const L = Math.floor(Y / 4);
  let day = Math.floor(Y * D + C) - L;

  // Apply known corrections for exceptional years
  day += getExceptionOffset(year, termIndex24);

  return day;
}

/**
 * Return the correction offset (+1, -1, or 0) for a specific year and term.
 */
function getExceptionOffset(year: number, termIndex24: number): number {
  let offset = 0;

  const increaseYears = INCREASE_OFFSET[termIndex24];
  if (increaseYears) {
    for (const y of increaseYears) {
      if (y === year) {
        offset += 1;
        break;
      }
    }
  }

  const decreaseYears = DECREASE_OFFSET[termIndex24];
  if (decreaseYears) {
    for (const y of decreaseYears) {
      if (y === year) {
        offset -= 1;
        break;
      }
    }
  }

  return offset;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Get the Gregorian date for a specific 절 (Jeol) solar term in a given year.
 *
 * @param year - Gregorian year (1920-2100)
 * @param jeolIndex - Index of the 절 term (0=소한 .. 11=대설)
 * @returns SolarTermDate with name, month, and day
 *
 * @example
 * ```ts
 * const ipchun2026 = getSolarTermDate(2026, 1);
 * // { name: '입춘', month: 2, day: 4 }
 * ```
 */
export function getSolarTermDate(year: number, jeolIndex: number): SolarTermDate {
  if (jeolIndex < 0 || jeolIndex > 11) {
    throw new Error(`jeolIndex must be 0-11, got ${jeolIndex}`);
  }
  if (year < 1920 || year > 2100) {
    throw new Error(`Year ${year} is out of supported range (1920-2100).`);
  }

  const termIndex24 = JEOL_INDICES_IN_24[jeolIndex];
  const day = computeTermDay(year, termIndex24);

  return {
    name: JEOL_NAMES[jeolIndex],
    month: JEOL_MONTHS[jeolIndex],
    day,
  };
}

/**
 * Get all 12 절 (Jeol) solar term dates for a given year.
 *
 * Returns them in calendar order: 소한 (Jan) through 대설 (Dec).
 *
 * @param year - Gregorian year (1920-2100)
 * @returns Array of 12 SolarTermDate objects
 *
 * @example
 * ```ts
 * const terms2026 = getJeolDatesForYear(2026);
 * // [
 * //   { name: '소한', month: 1, day: 5 },
 * //   { name: '입춘', month: 2, day: 4 },
 * //   { name: '경칩', month: 3, day: 5 },
 * //   { name: '청명', month: 4, day: 5 },
 * //   { name: '입하', month: 5, day: 5 },
 * //   { name: '망종', month: 6, day: 5 },
 * //   { name: '소서', month: 7, day: 7 },
 * //   { name: '입추', month: 8, day: 7 },
 * //   { name: '백로', month: 9, day: 7 },
 * //   { name: '한로', month: 10, day: 8 },
 * //   { name: '입동', month: 11, day: 7 },
 * //   { name: '대설', month: 12, day: 7 },
 * // ]
 * ```
 */
export function getJeolDatesForYear(year: number): SolarTermDate[] {
  const result: SolarTermDate[] = [];
  for (let i = 0; i < 12; i++) {
    result.push(getSolarTermDate(year, i));
  }
  return result;
}

/**
 * Determine which saju month a given Gregorian date falls in, based on 절 boundaries.
 *
 * In saju (사주), months are defined by 절 (Jeol) solar terms, not calendar months.
 * The saju year also starts at 입춘, so:
 *   - Dates from 입춘 (~Feb 4) to the day before 경칩 (~Mar 5) = 인월 (sajuMonth 1)
 *   - Dates from 경칩 to the day before 청명 = 묘월 (sajuMonth 2)
 *   - ...
 *   - Dates from 소한 (~Jan 5) to the day before 입춘 = 축월 (sajuMonth 12)
 *   - Dates from 대설 (prev year ~Dec 7) to the day before 소한 = 자월 (sajuMonth 11)
 *
 * NOTE: For dates in January before 소한, or in December after 대설, this function
 * needs to look at the neighboring year's term dates.
 *
 * @param year  - Gregorian year
 * @param month - Gregorian month (1-12)
 * @param day   - Gregorian day of month
 * @returns SajuMonthInfo with sajuMonth (1=인월 .. 12=축월), termName, and earthlyBranch
 *
 * @example
 * ```ts
 * const info = findMonthByDate(2026, 2, 3);
 * // Before 입춘 on Feb 4 => still 축월 (sajuMonth 12)
 * // { sajuMonth: 12, termName: '소한', earthlyBranch: '축' }
 *
 * const info2 = findMonthByDate(2026, 2, 4);
 * // On or after 입춘 => 인월 (sajuMonth 1)
 * // { sajuMonth: 1, termName: '입춘', earthlyBranch: '인' }
 * ```
 */
export function findMonthByDate(
  year: number,
  month: number,
  day: number
): SajuMonthInfo {
  // Build a complete ordered list of jeol boundaries that span
  // from 대설 of the previous year through 소한 of the next year.
  // This ensures we can handle any date in the given year.

  // Previous year's 대설 (term index 11)
  const prevDaeseol = getSolarTermDateSafe(year - 1, 11);
  // Current year's 12 terms
  const currentTerms = getJeolDatesForYearSafe(year);
  // Next year's 소한 (term index 0)
  const nextSohan = getSolarTermDateSafe(year + 1, 0);

  // Build boundary list: [{year, month, day, jeolIndex}]
  // jeolIndex here maps to JEOL_NAMES: 0=소한..11=대설
  interface Boundary {
    year: number;
    month: number;
    day: number;
    jeolIndex: number;
  }

  const boundaries: Boundary[] = [];

  // 대설 from previous year (jeolIndex = 11)
  if (prevDaeseol) {
    boundaries.push({
      year: year - 1,
      month: prevDaeseol.month,
      day: prevDaeseol.day,
      jeolIndex: 11,
    });
  }

  // Current year's 12 terms
  for (let i = 0; i < 12; i++) {
    const term = currentTerms[i];
    if (term) {
      boundaries.push({
        year,
        month: term.month,
        day: term.day,
        jeolIndex: i,
      });
    }
  }

  // Next year's 소한 (jeolIndex = 0)
  if (nextSohan) {
    boundaries.push({
      year: year + 1,
      month: nextSohan.month,
      day: nextSohan.day,
      jeolIndex: 0,
    });
  }

  // Convert the input date and each boundary to a comparable day-of-year value.
  // We use (month * 100 + day) as a simple comparable for within a year,
  // but since boundaries can span years we need absolute comparison.
  const inputAbsolute = toAbsoluteDay(year, month, day);

  // Find which boundary interval the date falls in.
  // The date belongs to boundary[i] if boundary[i] <= date < boundary[i+1].
  let matchedJeolIndex = -1;

  for (let i = boundaries.length - 1; i >= 0; i--) {
    const bAbsolute = toAbsoluteDay(boundaries[i].year, boundaries[i].month, boundaries[i].day);
    if (inputAbsolute >= bAbsolute) {
      matchedJeolIndex = boundaries[i].jeolIndex;
      break;
    }
  }

  // If still no match (date is before previous year's 대설 -- extremely unlikely),
  // fall back to 자월 (sajuMonth 11, 입동 of previous year)
  if (matchedJeolIndex === -1) {
    matchedJeolIndex = 10; // 입동
  }

  // Map jeolIndex (0=소한..11=대설) to sajuMonth (1=인월..12=축월)
  // jeolIndex 0 (소한)  => sajuMonth 12 (축월)
  // jeolIndex 1 (입춘)  => sajuMonth 1  (인월)
  // jeolIndex 2 (경칩)  => sajuMonth 2  (묘월)
  // ...
  // jeolIndex 11 (대설) => sajuMonth 11 (자월)
  const JEOL_TO_SAJU_MONTH: Record<number, number> = {
    0: 12,  // 소한 => 축월
    1: 1,   // 입춘 => 인월
    2: 2,   // 경칩 => 묘월
    3: 3,   // 청명 => 진월
    4: 4,   // 입하 => 사월
    5: 5,   // 망종 => 오월
    6: 6,   // 소서 => 미월
    7: 7,   // 입추 => 신월
    8: 8,   // 백로 => 유월
    9: 9,   // 한로 => 술월
    10: 10, // 입동 => 해월
    11: 11, // 대설 => 자월
  };

  const sajuMonth = JEOL_TO_SAJU_MONTH[matchedJeolIndex];
  const termName = JEOL_NAMES[matchedJeolIndex];
  const earthlyBranch = SAJU_MONTH_BRANCHES[sajuMonth - 1];

  return {
    sajuMonth,
    termName,
    earthlyBranch,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Safe version of getSolarTermDate that returns null for out-of-range years
 * instead of throwing.
 */
function getSolarTermDateSafe(year: number, jeolIndex: number): SolarTermDate | null {
  if (year < 1920 || year > 2100) {
    return null;
  }
  try {
    return getSolarTermDate(year, jeolIndex);
  } catch {
    return null;
  }
}

/**
 * Safe version of getJeolDatesForYear that returns an array with possible nulls
 * for out-of-range years.
 */
function getJeolDatesForYearSafe(year: number): (SolarTermDate | null)[] {
  if (year < 1920 || year > 2100) {
    return new Array(12).fill(null);
  }
  try {
    return getJeolDatesForYear(year);
  } catch {
    return new Array(12).fill(null);
  }
}

/**
 * Convert a date to an absolute day number for comparison across year boundaries.
 * Uses a simplified calculation: year * 400 + month * 32 + day.
 * This is only used for ordering / comparison, not for actual date arithmetic.
 */
function toAbsoluteDay(year: number, month: number, day: number): number {
  return year * 400 + month * 32 + day;
}

/**
 * Get the date of any of the 24 solar terms (not just 절 terms).
 * This is useful if you need 기 (Gi) terms as well.
 *
 * @param year - Gregorian year (1900-2100)
 * @param termIndex24 - Index in the 24-term system (0=소한 .. 23=동지)
 * @returns Object with name, month, and day
 */
export function get24TermDate(
  year: number,
  termIndex24: number
): { name: string; month: number; day: number } {
  if (termIndex24 < 0 || termIndex24 > 23) {
    throw new Error(`termIndex24 must be 0-23, got ${termIndex24}`);
  }

  const day = computeTermDay(year, termIndex24);

  // Each pair of terms shares a month: terms 0-1 => Jan, 2-3 => Feb, etc.
  const monthForTerm = Math.floor(termIndex24 / 2) + 1;

  return {
    name: ALL_24_TERM_NAMES[termIndex24],
    month: monthForTerm,
    day,
  };
}

/**
 * Determine the saju year for a given Gregorian date.
 * The saju year starts at 입춘 (around Feb 4), so dates before 입춘
 * belong to the previous saju year.
 *
 * @param year  - Gregorian year
 * @param month - Gregorian month (1-12)
 * @param day   - Gregorian day
 * @returns The saju year (which may be year - 1 if before 입춘)
 */
export function getSajuYear(year: number, month: number, day: number): number {
  const ipchun = getSolarTermDate(year, 1); // index 1 = 입춘
  const inputAbsolute = toAbsoluteDay(year, month, day);
  const ipchunAbsolute = toAbsoluteDay(year, ipchun.month, ipchun.day);

  return inputAbsolute >= ipchunAbsolute ? year : year - 1;
}
