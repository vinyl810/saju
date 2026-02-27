/**
 * 진태양시(True Solar Time) 보정 시스템
 *
 * 표준시는 시간대의 기준경선에 맞춰져 있지만, 실제 태양의 위치는
 * 출생지의 경도에 따라 다르다. 사주에서는 진태양시를 사용해야
 * 정확한 시주를 산출할 수 있다.
 *
 * 보정 공식: (기준경선 - 출생지경도) × 4분
 */

// ===== 도시 데이터 =====

export interface CityData {
  name: string;
  nameEn: string;
  country: string;
  longitude: number;
  latitude: number;
  utcOffset: number; // hours
}

export interface CityGroup {
  label: string;
  cities: CityData[];
}

const KOREA_CITIES: CityData[] = [
  { name: '서울', nameEn: 'Seoul', country: 'KR', longitude: 126.98, latitude: 37.57, utcOffset: 9 },
  { name: '부산', nameEn: 'Busan', country: 'KR', longitude: 129.08, latitude: 35.18, utcOffset: 9 },
  { name: '인천', nameEn: 'Incheon', country: 'KR', longitude: 126.71, latitude: 37.46, utcOffset: 9 },
  { name: '대구', nameEn: 'Daegu', country: 'KR', longitude: 128.60, latitude: 35.87, utcOffset: 9 },
  { name: '대전', nameEn: 'Daejeon', country: 'KR', longitude: 127.38, latitude: 36.35, utcOffset: 9 },
  { name: '광주', nameEn: 'Gwangju', country: 'KR', longitude: 126.85, latitude: 35.16, utcOffset: 9 },
  { name: '울산', nameEn: 'Ulsan', country: 'KR', longitude: 129.31, latitude: 35.54, utcOffset: 9 },
  { name: '수원', nameEn: 'Suwon', country: 'KR', longitude: 127.01, latitude: 37.26, utcOffset: 9 },
  { name: '창원', nameEn: 'Changwon', country: 'KR', longitude: 128.68, latitude: 35.23, utcOffset: 9 },
  { name: '전주', nameEn: 'Jeonju', country: 'KR', longitude: 127.15, latitude: 35.82, utcOffset: 9 },
  { name: '청주', nameEn: 'Cheongju', country: 'KR', longitude: 127.49, latitude: 36.64, utcOffset: 9 },
  { name: '제주', nameEn: 'Jeju', country: 'KR', longitude: 126.53, latitude: 33.50, utcOffset: 9 },
  { name: '포항', nameEn: 'Pohang', country: 'KR', longitude: 129.37, latitude: 36.02, utcOffset: 9 },
  { name: '천안', nameEn: 'Cheonan', country: 'KR', longitude: 127.15, latitude: 36.81, utcOffset: 9 },
  { name: '안동', nameEn: 'Andong', country: 'KR', longitude: 128.73, latitude: 36.57, utcOffset: 9 },
  { name: '강릉', nameEn: 'Gangneung', country: 'KR', longitude: 128.90, latitude: 37.75, utcOffset: 9 },
  { name: '목포', nameEn: 'Mokpo', country: 'KR', longitude: 126.39, latitude: 34.79, utcOffset: 9 },
];

const EAST_ASIA_CITIES: CityData[] = [
  { name: '도쿄', nameEn: 'Tokyo', country: 'JP', longitude: 139.69, latitude: 35.68, utcOffset: 9 },
  { name: '오사카', nameEn: 'Osaka', country: 'JP', longitude: 135.50, latitude: 34.69, utcOffset: 9 },
  { name: '베이징', nameEn: 'Beijing', country: 'CN', longitude: 116.41, latitude: 39.90, utcOffset: 8 },
  { name: '상하이', nameEn: 'Shanghai', country: 'CN', longitude: 121.47, latitude: 31.23, utcOffset: 8 },
  { name: '광저우', nameEn: 'Guangzhou', country: 'CN', longitude: 113.26, latitude: 23.13, utcOffset: 8 },
  { name: '선전', nameEn: 'Shenzhen', country: 'CN', longitude: 114.06, latitude: 22.54, utcOffset: 8 },
  { name: '홍콩', nameEn: 'Hong Kong', country: 'HK', longitude: 114.17, latitude: 22.28, utcOffset: 8 },
  { name: '타이베이', nameEn: 'Taipei', country: 'TW', longitude: 121.57, latitude: 25.03, utcOffset: 8 },
  { name: '울란바토르', nameEn: 'Ulaanbaatar', country: 'MN', longitude: 106.91, latitude: 47.89, utcOffset: 8 },
];

const SOUTHEAST_ASIA_CITIES: CityData[] = [
  { name: '방콕', nameEn: 'Bangkok', country: 'TH', longitude: 100.50, latitude: 13.76, utcOffset: 7 },
  { name: '호치민', nameEn: 'Ho Chi Minh', country: 'VN', longitude: 106.63, latitude: 10.82, utcOffset: 7 },
  { name: '하노이', nameEn: 'Hanoi', country: 'VN', longitude: 105.85, latitude: 21.03, utcOffset: 7 },
  { name: '싱가포르', nameEn: 'Singapore', country: 'SG', longitude: 103.82, latitude: 1.35, utcOffset: 8 },
  { name: '쿠알라룸푸르', nameEn: 'Kuala Lumpur', country: 'MY', longitude: 101.69, latitude: 3.14, utcOffset: 8 },
  { name: '자카르타', nameEn: 'Jakarta', country: 'ID', longitude: 106.85, latitude: -6.21, utcOffset: 7 },
  { name: '마닐라', nameEn: 'Manila', country: 'PH', longitude: 120.98, latitude: 14.60, utcOffset: 8 },
];

const AMERICAS_CITIES: CityData[] = [
  { name: '뉴욕', nameEn: 'New York', country: 'US', longitude: -74.01, latitude: 40.71, utcOffset: -5 },
  { name: '로스앤젤레스', nameEn: 'Los Angeles', country: 'US', longitude: -118.24, latitude: 33.94, utcOffset: -8 },
  { name: '시카고', nameEn: 'Chicago', country: 'US', longitude: -87.63, latitude: 41.88, utcOffset: -6 },
  { name: '샌프란시스코', nameEn: 'San Francisco', country: 'US', longitude: -122.42, latitude: 37.77, utcOffset: -8 },
  { name: '시애틀', nameEn: 'Seattle', country: 'US', longitude: -122.33, latitude: 47.61, utcOffset: -8 },
  { name: '워싱턴 D.C.', nameEn: 'Washington D.C.', country: 'US', longitude: -77.04, latitude: 38.91, utcOffset: -5 },
  { name: '보스턴', nameEn: 'Boston', country: 'US', longitude: -71.06, latitude: 42.36, utcOffset: -5 },
  { name: '호놀룰루', nameEn: 'Honolulu', country: 'US', longitude: -157.86, latitude: 21.31, utcOffset: -10 },
  { name: '밴쿠버', nameEn: 'Vancouver', country: 'CA', longitude: -123.12, latitude: 49.28, utcOffset: -8 },
  { name: '토론토', nameEn: 'Toronto', country: 'CA', longitude: -79.38, latitude: 43.65, utcOffset: -5 },
  { name: '상파울루', nameEn: 'São Paulo', country: 'BR', longitude: -46.63, latitude: -23.55, utcOffset: -3 },
];

const EUROPE_CITIES: CityData[] = [
  { name: '런던', nameEn: 'London', country: 'GB', longitude: -0.13, latitude: 51.51, utcOffset: 0 },
  { name: '파리', nameEn: 'Paris', country: 'FR', longitude: 2.35, latitude: 48.86, utcOffset: 1 },
  { name: '베를린', nameEn: 'Berlin', country: 'DE', longitude: 13.41, latitude: 52.52, utcOffset: 1 },
  { name: '로마', nameEn: 'Rome', country: 'IT', longitude: 12.50, latitude: 41.90, utcOffset: 1 },
  { name: '마드리드', nameEn: 'Madrid', country: 'ES', longitude: -3.70, latitude: 40.42, utcOffset: 1 },
  { name: '모스크바', nameEn: 'Moscow', country: 'RU', longitude: 37.62, latitude: 55.76, utcOffset: 3 },
  { name: '이스탄불', nameEn: 'Istanbul', country: 'TR', longitude: 28.98, latitude: 41.01, utcOffset: 3 },
];

const OCEANIA_CITIES: CityData[] = [
  { name: '시드니', nameEn: 'Sydney', country: 'AU', longitude: 151.21, latitude: -33.87, utcOffset: 10 },
  { name: '멜버른', nameEn: 'Melbourne', country: 'AU', longitude: 144.96, latitude: -37.81, utcOffset: 10 },
  { name: '오클랜드', nameEn: 'Auckland', country: 'NZ', longitude: 174.76, latitude: -36.85, utcOffset: 12 },
];

export const CITY_GROUPS: CityGroup[] = [
  { label: '한국', cities: KOREA_CITIES },
  { label: '동아시아', cities: EAST_ASIA_CITIES },
  { label: '동남아시아', cities: SOUTHEAST_ASIA_CITIES },
  { label: '미주', cities: AMERICAS_CITIES },
  { label: '유럽', cities: EUROPE_CITIES },
  { label: '오세아니아', cities: OCEANIA_CITIES },
];

export const ALL_CITIES: CityData[] = CITY_GROUPS.flatMap(g => g.cities);

/**
 * 도시 이름으로 도시 데이터 찾기
 */
export function findCity(name: string): CityData | undefined {
  return ALL_CITIES.find(c => c.name === name || c.nameEn === name);
}

// ===== 한국 역사적 시간대 =====

interface KoreaTimezone {
  startYear: number;
  endYear: number;
  utcOffsetHours: number;
  standardMeridian: number; // degrees
}

/**
 * 한국 역사적 표준시 변천
 * - 1908~1911: UTC+8:30 (기준경선 127.5°)
 * - 1912~1953: UTC+9:00 (기준경선 135°, 일제강점기)
 * - 1954~1960: UTC+8:30 (기준경선 127.5°, 광복 후)
 * - 1961~현재: UTC+9:00 (기준경선 135°)
 */
const KOREA_TIMEZONES: KoreaTimezone[] = [
  { startYear: 1908, endYear: 1911, utcOffsetHours: 8.5, standardMeridian: 127.5 },
  { startYear: 1912, endYear: 1953, utcOffsetHours: 9, standardMeridian: 135 },
  { startYear: 1954, endYear: 1960, utcOffsetHours: 8.5, standardMeridian: 127.5 },
  { startYear: 1961, endYear: 9999, utcOffsetHours: 9, standardMeridian: 135 },
];

/**
 * 한국 출생연도에 맞는 기준경선 반환
 */
function getKoreaStandardMeridian(birthYear: number): number {
  for (const tz of KOREA_TIMEZONES) {
    if (birthYear >= tz.startYear && birthYear <= tz.endYear) {
      return tz.standardMeridian;
    }
  }
  // 1908 이전은 135° 사용 (근대 이전)
  return 135;
}

// ===== 보정 계산 =====

export interface SolarTimeCorrectionResult {
  applied: boolean;
  originalHour: number;
  originalMinute: number;
  correctedHour: number;
  correctedMinute: number;
  correctionMinutes: number; // 보정된 분 수 (양수: 시간이 늦어짐, 음수: 시간이 빨라짐)
  dayOffset: number; // -1, 0, +1
  birthPlace?: string;
  longitude?: number;
}

/**
 * 진태양시 보정 계산
 *
 * @param birthYear 출생 연도 (양력)
 * @param hour 출생 시 (0-23)
 * @param minute 출생 분 (0-59)
 * @param longitude 출생지 경도
 * @param isKorea 한국 도시 여부 (역사적 기준경선 적용)
 * @param utcOffset 해외 도시의 UTC 오프셋 (시간)
 * @returns 보정 결과
 */
export function calculateSolarTimeCorrection(
  birthYear: number,
  hour: number,
  minute: number,
  longitude: number,
  isKorea: boolean,
  utcOffset?: number,
): SolarTimeCorrectionResult {
  // 기준경선 결정
  let standardMeridian: number;
  if (isKorea) {
    standardMeridian = getKoreaStandardMeridian(birthYear);
  } else if (utcOffset !== undefined) {
    standardMeridian = utcOffset * 15;
  } else {
    // fallback: UTC+9 기준
    standardMeridian = 135;
  }

  // 보정값 계산: (기준경선 - 출생지경도) × 4분
  // 기준경선보다 서쪽이면 태양이 늦게 뜨므로 시간을 빼야 함
  const correctionMinutes = -Math.round((standardMeridian - longitude) * 4);

  // 보정 적용
  let totalMinutes = hour * 60 + minute + correctionMinutes;
  let dayOffset = 0;

  if (totalMinutes < 0) {
    dayOffset = -1;
    totalMinutes += 24 * 60;
  } else if (totalMinutes >= 24 * 60) {
    dayOffset = 1;
    totalMinutes -= 24 * 60;
  }

  const correctedHour = Math.floor(totalMinutes / 60);
  const correctedMinute = totalMinutes % 60;

  return {
    applied: true,
    originalHour: hour,
    originalMinute: minute,
    correctedHour,
    correctedMinute,
    correctionMinutes,
    dayOffset,
  };
}

/**
 * 도시 이름으로 보정 계산 (편의 함수)
 */
export function calculateSolarTimeCorrectionByCity(
  birthYear: number,
  hour: number,
  minute: number,
  cityName: string,
): SolarTimeCorrectionResult | null {
  const city = findCity(cityName);
  if (!city) return null;

  const isKorea = city.country === 'KR';
  const result = calculateSolarTimeCorrection(
    birthYear, hour, minute,
    city.longitude, isKorea, city.utcOffset,
  );

  return {
    ...result,
    birthPlace: city.name,
    longitude: city.longitude,
  };
}

/**
 * 경도로 UTC 오프셋 추정 (Nominatim 결과용)
 */
export function estimateUtcOffset(longitude: number): number {
  return Math.round(longitude / 15);
}

/**
 * 경도로 직접 보정 계산 (도시 선택 없이 경도 직접 입력 시)
 * utcOffset 미지정 시 경도에서 추정
 */
export function calculateSolarTimeCorrectionByLongitude(
  birthYear: number,
  hour: number,
  minute: number,
  longitude: number,
  utcOffset?: number,
): SolarTimeCorrectionResult {
  if (utcOffset === undefined) {
    utcOffset = estimateUtcOffset(longitude);
  }
  // 경도가 한국 범위(124~132)이면 한국으로 간주
  const isKorea = longitude >= 124 && longitude <= 132;

  const result = calculateSolarTimeCorrection(
    birthYear, hour, minute,
    longitude, isKorea, utcOffset,
  );

  return {
    ...result,
    longitude,
  };
}
