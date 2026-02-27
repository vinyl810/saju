'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, X, Map, Loader2, Search, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCitySearch, reverseGeocode, findNearestLocal } from '@/hooks/use-city-search';
import { estimateUtcOffset } from '@/lib/saju/solar-time';
import type { CitySearchResult } from '@/hooks/use-city-search';

const CityMapInner = dynamic(() => import('./city-map-inner'), {
  ssr: false,
  loading: () => (
    <div className="h-[240px] w-full rounded-lg border bg-muted/30 animate-pulse flex flex-col items-center justify-center gap-2 text-muted-foreground">
      <Globe className="h-6 w-6 animate-spin" />
      <span className="text-xs">지도 로딩 중...</span>
    </div>
  ),
});

export interface CityPickerValue {
  name: string;
  longitude: number;
  latitude?: number;
}

interface CityPickerProps {
  value?: CityPickerValue;
  onChange: (city: { name: string; longitude: number; latitude: number; utcOffset: number } | null) => void;
  hideMap?: boolean;
  mapOnly?: boolean;
}

export function CityPicker({ value, onChange, hideMap = false, mapOnly = false }: CityPickerProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [isReversing, setIsReversing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { localResults, remoteResults, isSearching } = useCitySearch(query);
  const allResults = [...localResults, ...remoteResults];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-result-item]');
      items[highlightIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex]);

  const selectCity = useCallback((result: CitySearchResult) => {
    onChange({
      name: result.name,
      longitude: result.longitude,
      latitude: result.latitude,
      utcOffset: result.utcOffset,
    });
    setQuery('');
    setIsOpen(false);
    setHighlightIndex(-1);
  }, [onChange]);

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    // 1) 즉시: 로컬 도시 or 좌표로 바로 선택 (Optimistic)
    const nearest = findNearestLocal(lat, lng);
    const optimistic: CitySearchResult = nearest ?? {
      name: `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
      nameEn: '',
      country: '',
      longitude: lng,
      latitude: lat,
      utcOffset: estimateUtcOffset(lng),
      source: 'nominatim',
    };
    selectCity(optimistic);

    // 2) 백그라운드: Nominatim으로 정확한 도시명 가져와서 교체
    if (!nearest) {
      setIsReversing(true);
      const result = await reverseGeocode(lat, lng);
      setIsReversing(false);
      if (result) {
        onChange({
          name: result.name,
          longitude: result.longitude,
          latitude: result.latitude,
          utcOffset: result.utcOffset,
        });
      }
    }
  }, [selectCity, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || allResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex(prev => (prev + 1) % allResults.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex(prev => (prev - 1 + allResults.length) % allResults.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < allResults.length) {
          selectCity(allResults[highlightIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightIndex(-1);
        break;
    }
  };

  const handleClear = () => {
    onChange(null);
    setQuery('');
    inputRef.current?.focus();
  };

  const selectedPosition: [number, number] | null =
    value?.latitude && value?.longitude ? [value.latitude, value.longitude] : null;

  return (
    <div ref={containerRef} className="relative space-y-2">
      {/* Selected city display or search input */}
      {mapOnly ? null : value ? (
        <div className="flex items-center gap-2 rounded-lg border bg-accent/30 px-3 py-2.5 text-sm">
          <MapPin className="h-4 w-4 text-indigo-500 shrink-0" />
          <span className="flex-1 font-medium">{value.name}</span>
          <span className="text-xs text-muted-foreground">
            {value.longitude.toFixed(2)}°
          </span>
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="도시 이름으로 검색 (예: 서울, Tokyo, 파리)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setHighlightIndex(-1);
            }}
            onFocus={() => query.trim() && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="pl-9 pr-9"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      )}

      {/* Autocomplete dropdown */}
      {!mapOnly && isOpen && (allResults.length > 0 || isSearching) && (
        <div
          ref={listRef}
          className="absolute z-50 w-full rounded-lg border bg-popover shadow-lg max-h-64 overflow-y-auto"
        >
          {localResults.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                추천 도시
              </div>
              {localResults.map((r, i) => (
                <button
                  key={`local-${r.nameEn}`}
                  type="button"
                  data-result-item
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-accent/50 flex items-center gap-2 transition-colors ${
                    highlightIndex === i ? 'bg-accent' : ''
                  }`}
                  onClick={() => selectCity(r)}
                  onMouseEnter={() => setHighlightIndex(i)}
                >
                  <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span className="flex-1 truncate">
                    {r.name} <span className="text-muted-foreground">({r.nameEn})</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">{r.country}</span>
                </button>
              ))}
            </>
          )}
          {remoteResults.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 border-t">
                검색 결과
              </div>
              {remoteResults.map((r, i) => (
                <button
                  key={`remote-${i}-${r.longitude}`}
                  type="button"
                  data-result-item
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-accent/50 flex items-center gap-2 transition-colors ${
                    highlightIndex === localResults.length + i ? 'bg-accent' : ''
                  }`}
                  onClick={() => selectCity(r)}
                  onMouseEnter={() => setHighlightIndex(localResults.length + i)}
                >
                  <Globe className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="flex-1 truncate">
                    {r.name}
                    {r.displayName && r.displayName !== r.name && (
                      <span className="text-muted-foreground text-xs ml-1">{r.displayName}</span>
                    )}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">{r.country}</span>
                </button>
              ))}
            </>
          )}
          {isSearching && allResults.length === 0 && (
            <div className="px-3 py-4 text-sm text-center text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              검색 중...
            </div>
          )}
        </div>
      )}

      {/* Map toggle */}
      {!hideMap && !mapOnly && (
        <>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 h-7"
              onClick={() => setShowMap(!showMap)}
            >
              <Map className="h-3.5 w-3.5" />
              {showMap ? '지도 숨기기' : '지도에서 선택'}
            </Button>
            {isReversing && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                위치 확인 중...
              </span>
            )}
          </div>

          {showMap && (
            <CityMapInner
              selectedPosition={selectedPosition}
              onMapClick={handleMapClick}
            />
          )}
        </>
      )}

      {/* Map always visible in mapOnly mode */}
      {mapOnly && (
        <>
          {isReversing && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              위치 확인 중...
            </span>
          )}
          <CityMapInner
            selectedPosition={selectedPosition}
            onMapClick={handleMapClick}
          />
        </>
      )}
    </div>
  );
}
