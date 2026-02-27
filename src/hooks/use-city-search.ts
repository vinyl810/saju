'use client';

import { useState, useEffect, useRef } from 'react';
import { ALL_CITIES, estimateUtcOffset } from '@/lib/saju/solar-time';

export interface CitySearchResult {
  name: string;
  nameEn: string;
  country: string;
  longitude: number;
  latitude: number;
  utcOffset: number;
  displayName?: string; // Nominatim full display name
  source: 'local' | 'nominatim';
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
  name?: string;
}

function localSearch(query: string): CitySearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return ALL_CITIES
    .filter(c => c.name.toLowerCase().includes(q) || c.nameEn.toLowerCase().includes(q))
    .map(c => ({
      name: c.name,
      nameEn: c.nameEn,
      country: c.country,
      longitude: c.longitude,
      latitude: c.latitude,
      utcOffset: c.utcOffset,
      source: 'local' as const,
    }));
}

function extractCityName(result: NominatimResult): string {
  const addr = result.address;
  if (addr) {
    return addr.city || addr.town || addr.village || addr.county || addr.state || '';
  }
  return result.name || result.display_name.split(',')[0];
}

function isDuplicate(result: CitySearchResult, localResults: CitySearchResult[]): boolean {
  return localResults.some(
    lr => Math.abs(lr.longitude - result.longitude) < 0.5 && Math.abs(lr.latitude - result.latitude) < 0.5
  );
}

export function useCitySearch(query: string) {
  const [localResults, setLocalResults] = useState<CitySearchResult[]>([]);
  const [remoteResults, setRemoteResults] = useState<CitySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Immediate local search
  useEffect(() => {
    setLocalResults(localSearch(query));
  }, [query]);

  // Debounced Nominatim search — 300ms, 1글자부터
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (!query.trim()) {
      setRemoteResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const params = new URLSearchParams({
          q: query,
          format: 'json',
          limit: '8',
          'accept-language': 'ko,en',
          addressdetails: '1',
        });
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          {
            signal: controller.signal,
            headers: { 'User-Agent': 'SajuApp/1.0' },
          },
        );
        if (!res.ok) throw new Error('Nominatim error');
        const data: NominatimResult[] = await res.json();

        const currentLocal = localSearch(query);
        const mapped: CitySearchResult[] = data
          .map(r => {
            const lng = parseFloat(r.lon);
            const lat = parseFloat(r.lat);
            const cityName = extractCityName(r) || r.display_name.split(',')[0];
            // 간결한 표시명: "도시, 국가" 형태
            const parts = r.display_name.split(',').map(s => s.trim());
            const displayName = parts.length > 1
              ? `${parts[0]}, ${parts[parts.length - 1]}`
              : parts[0];
            return {
              name: cityName,
              nameEn: parts[0],
              country: r.address?.country_code?.toUpperCase() || '',
              longitude: lng,
              latitude: lat,
              utcOffset: estimateUtcOffset(lng),
              displayName,
              source: 'nominatim' as const,
            };
          })
          .filter(r => !isDuplicate(r, currentLocal));

        if (!controller.signal.aborted) {
          setRemoteResults(mapped);
          setIsSearching(false);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (!controller.signal.aborted) {
          setRemoteResults([]);
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [query]);

  return { localResults, remoteResults, isSearching };
}

/**
 * 좌표에서 가장 가까운 로컬 도시 찾기 (즉시 반환, 네트워크 불필요)
 * 50km 이내일 때만 반환
 */
export function findNearestLocal(lat: number, lng: number): CitySearchResult | null {
  let best: { city: typeof ALL_CITIES[number]; dist: number } | null = null;
  for (const c of ALL_CITIES) {
    const dlat = c.latitude - lat;
    const dlng = c.longitude - lng;
    const dist = dlat * dlat + dlng * dlng;
    if (!best || dist < best.dist) {
      best = { city: c, dist };
    }
  }
  // ~0.45도 ≈ 50km
  if (!best || best.dist > 0.45 * 0.45) return null;
  return {
    name: best.city.name,
    nameEn: best.city.nameEn,
    country: best.city.country,
    longitude: best.city.longitude,
    latitude: best.city.latitude,
    utcOffset: best.city.utcOffset,
    source: 'local',
  };
}

export async function reverseGeocode(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<CitySearchResult | null> {
  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      format: 'json',
      'accept-language': 'ko,en',
      addressdetails: '1',
      zoom: '10',
    });
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params}`,
      {
        signal,
        headers: { 'User-Agent': 'SajuApp/1.0' },
      },
    );
    if (!res.ok) return null;
    const data: NominatimResult = await res.json();

    const cityName = extractCityName(data);
    const parts = data.display_name?.split(',').map(s => s.trim()) || [];
    const displayName = parts.length > 1
      ? `${parts[0]}, ${parts[parts.length - 1]}`
      : parts[0] || '';

    return {
      name: cityName || `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
      nameEn: parts[0] || '',
      country: data.address?.country_code?.toUpperCase() || '',
      longitude: lng,
      latitude: lat,
      utcOffset: estimateUtcOffset(lng),
      displayName,
      source: 'nominatim',
    };
  } catch {
    return null;
  }
}
