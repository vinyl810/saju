'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ComboSelect } from '@/components/ui/combo-select';
import { calculateSolarTimeCorrectionByLongitude } from '@/lib/saju/solar-time';
import { CityPicker } from '@/components/saju/city-picker';
import type { BirthInput, Gender } from '@/lib/saju/types';
import { TermTooltip } from '@/components/ui/term-tooltip';

const HOUR_OPTIONS = [
  { value: '0', label: '자시 (子) 00:00~00:59' },
  { value: '1', label: '축시 (丑) 01:00~02:59' },
  { value: '3', label: '인시 (寅) 03:00~04:59' },
  { value: '5', label: '묘시 (卯) 05:00~06:59' },
  { value: '7', label: '진시 (辰) 07:00~08:59' },
  { value: '9', label: '사시 (巳) 09:00~10:59' },
  { value: '11', label: '오시 (午) 11:00~12:59' },
  { value: '13', label: '미시 (未) 13:00~14:59' },
  { value: '15', label: '신시 (申) 15:00~16:59' },
  { value: '17', label: '유시 (酉) 17:00~18:59' },
  { value: '19', label: '술시 (戌) 19:00~20:59' },
  { value: '21', label: '해시 (亥) 21:00~22:59' },
  { value: '23', label: '야자시 (夜子) 23:00~23:59' },
];

const YEAR_OPTIONS = Array.from({ length: 106 }, (_, i) => ({
  value: String(2025 - i),
  label: `${2025 - i}년`,
})); // 2025~1920

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}월`,
}));

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}일`,
}));

interface BirthFormProps {
  onSubmit?: (input: BirthInput) => void;
  onChange?: (input: BirthInput) => void;
  loading?: boolean;
  title?: string;
  compact?: boolean;
  hideSubmit?: boolean;
}

export function BirthForm({ onSubmit, onChange, loading = false, title = '생년월일시 입력', compact = false, hideSubmit = false }: BirthFormProps) {
  const router = useRouter();
  const [year, setYear] = useState('1990');
  const [month, setMonth] = useState('1');
  const [day, setDay] = useState('1');
  const [hour, setHour] = useState('0');
  const [gender, setGender] = useState<Gender>('남');
  const [isLunar, setIsLunar] = useState(false);
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [useYajasi, setUseYajasi] = useState(false);

  // 고급 옵션
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [birthPlace, setBirthPlace] = useState('');
  const [birthLongitude, setBirthLongitude] = useState<number | undefined>();
  const [birthUtcOffset, setBirthUtcOffset] = useState<number | undefined>();
  const [birthLatitude, setBirthLatitude] = useState<number | undefined>();
  const [customLongitude, setCustomLongitude] = useState('');
  const [useCustomLongitude, setUseCustomLongitude] = useState(false);

  // 보정 미리보기 계산
  const correctionPreview = useMemo(() => {
    const birthYear = parseInt(year);
    const birthHour = parseInt(hour);

    if (useCustomLongitude && customLongitude) {
      const lng = parseFloat(customLongitude);
      if (!isNaN(lng) && lng >= -180 && lng <= 180) {
        return calculateSolarTimeCorrectionByLongitude(birthYear, birthHour, 0, lng);
      }
      return null;
    }

    if (birthPlace && birthLongitude !== undefined) {
      const utcOff = birthUtcOffset;
      return calculateSolarTimeCorrectionByLongitude(birthYear, birthHour, 0, birthLongitude, utcOff);
    }

    return null;
  }, [year, hour, birthPlace, birthLongitude, birthUtcOffset, customLongitude, useCustomLongitude]);

  // onChange 모드: 필드가 변할 때마다 부모에 현재 입력값 전달
  useEffect(() => {
    if (!onChange) return;

    const effectiveLongitude = useCustomLongitude && customLongitude
      ? parseFloat(customLongitude)
      : birthLongitude;
    const effectiveUtcOffset = useCustomLongitude ? undefined : birthUtcOffset;

    onChange({
      year: parseInt(year),
      month: parseInt(month),
      day: parseInt(day),
      hour: parseInt(hour),
      minute: 0,
      gender,
      isLunar,
      isLeapMonth,
      useYajasi,
      birthPlace: useCustomLongitude ? undefined : (birthPlace || undefined),
      longitude: effectiveLongitude,
      utcOffset: effectiveUtcOffset,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, day, hour, gender, isLunar, isLeapMonth, useYajasi, birthPlace, birthLongitude, birthUtcOffset, customLongitude, useCustomLongitude]);

  const handleCityPickerChange = (city: { name: string; longitude: number; latitude: number; utcOffset: number } | null) => {
    if (city) {
      setBirthPlace(city.name);
      setBirthLongitude(city.longitude);
      setBirthLatitude(city.latitude);
      setBirthUtcOffset(city.utcOffset);
      setUseCustomLongitude(false);
      setCustomLongitude('');
    } else {
      setBirthPlace('');
      setBirthLongitude(undefined);
      setBirthLatitude(undefined);
      setBirthUtcOffset(undefined);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const effectiveLongitude = useCustomLongitude && customLongitude
      ? parseFloat(customLongitude)
      : birthLongitude;

    const effectiveUtcOffset = useCustomLongitude ? undefined : birthUtcOffset;

    const input: BirthInput = {
      year: parseInt(year),
      month: parseInt(month),
      day: parseInt(day),
      hour: parseInt(hour),
      minute: 0,
      gender,
      isLunar,
      isLeapMonth,
      useYajasi,
      birthPlace: useCustomLongitude ? undefined : (birthPlace || undefined),
      longitude: effectiveLongitude,
      utcOffset: effectiveUtcOffset,
    };

    if (onSubmit) {
      onSubmit(input);
    } else {
      const params = new URLSearchParams({
        year, month, day, hour,
        gender,
        isLunar: String(isLunar),
        isLeapMonth: String(isLeapMonth),
        useYajasi: String(useYajasi),
      });
      if (input.birthPlace) params.set('birthPlace', input.birthPlace);
      if (input.longitude !== undefined) params.set('longitude', String(input.longitude));
      if (input.utcOffset !== undefined) params.set('utcOffset', String(input.utcOffset));
      router.push(`/result?${params.toString()}`);
    }
  };

  return (
    <Card className={compact ? '' : 'mx-auto max-w-lg'}>
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 생년월일 */}
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="year">년</Label>
                <ComboSelect
                  id="year"
                  value={year}
                  onValueChange={setYear}
                  options={YEAR_OPTIONS}
                  min={1920}
                  max={2025}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="month">월</Label>
                <ComboSelect
                  id="month"
                  value={month}
                  onValueChange={setMonth}
                  options={MONTH_OPTIONS}
                  min={1}
                  max={12}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="day">일</Label>
                <ComboSelect
                  id="day"
                  value={day}
                  onValueChange={setDay}
                  options={DAY_OPTIONS}
                  min={1}
                  max={31}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="lunar-switch"
                  checked={isLunar}
                  onCheckedChange={setIsLunar}
                />
                <TermTooltip termKey="음력">
                  <Label htmlFor="lunar-switch" className="text-sm font-normal cursor-pointer">음력</Label>
                </TermTooltip>
              </div>
              {isLunar && (
                <div className="flex items-center gap-2">
                  <Switch
                    id="leap-switch"
                    checked={isLeapMonth}
                    onCheckedChange={setIsLeapMonth}
                  />
                  <TermTooltip termKey="윤달">
                    <Label htmlFor="leap-switch" className="text-sm font-normal cursor-pointer">윤달</Label>
                  </TermTooltip>
                </div>
              )}
            </div>
          </div>

          {/* 시간 */}
          <div className="space-y-2">
            <div className="space-y-1.5">
              <Label htmlFor="hour">태어난 시간</Label>
              <Select value={hour} onValueChange={setHour}>
                <SelectTrigger id="hour">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOUR_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {parseInt(hour) === 23 && (
              <div className="flex items-center gap-2">
                <Switch
                  id="yajasi-switch"
                  checked={useYajasi}
                  onCheckedChange={setUseYajasi}
                />
                <TermTooltip termKey="야자시">
                  <Label htmlFor="yajasi-switch" className="text-sm font-normal cursor-pointer">야자시 (다음날 적용)</Label>
                </TermTooltip>
              </div>
            )}
          </div>

          {/* 성별 */}
          <div className="space-y-1.5">
            <Label>성별</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={gender === '남' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setGender('남')}
              >
                남성
              </Button>
              <Button
                type="button"
                variant={gender === '여' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setGender('여')}
              >
                여성
              </Button>
            </div>
          </div>

          {/* 출생 지역 */}
          <div className="space-y-1.5">
            <Label className="text-sm">출생 지역</Label>
            <CityPicker
              hideMap
              value={birthPlace ? { name: birthPlace, longitude: birthLongitude ?? 0, latitude: birthLatitude } : undefined}
              onChange={handleCityPickerChange}
            />
          </div>

          {/* 고급 옵션 (진태양시 보정) */}
          <div className="rounded-lg border">
            <button
              type="button"
              className="flex w-full items-center justify-between p-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span>고급 옵션 (<TermTooltip termKey="진태양시">진태양시</TermTooltip> 보정)</span>
              <ChevronRight
                className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
              />
            </button>

            {showAdvanced && (
              <div className="border-t px-3 pb-3 pt-3 space-y-3">
                <CityPicker
                  mapOnly
                  value={birthPlace ? { name: birthPlace, longitude: birthLongitude ?? 0, latitude: birthLatitude } : undefined}
                  onChange={handleCityPickerChange}
                />

                <div className="flex items-center justify-between">
                  <Label htmlFor="custom-lng-switch" className="text-sm font-normal cursor-pointer">
                    직접 경도 입력
                  </Label>
                  <Switch
                    id="custom-lng-switch"
                    checked={useCustomLongitude}
                    onCheckedChange={(checked) => {
                      setUseCustomLongitude(checked);
                      if (checked) {
                        setBirthPlace('');
                        setBirthLongitude(undefined);
                        setBirthLatitude(undefined);
                        setBirthUtcOffset(undefined);
                      }
                    }}
                  />
                </div>

                {useCustomLongitude && (
                  <div className="space-y-1.5">
                    <Label htmlFor="longitude" className="text-sm font-normal">
                      경도 (예: 126.98)
                    </Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.01"
                      min="-180"
                      max="180"
                      placeholder="경도를 입력하세요"
                      value={customLongitude}
                      onChange={(e) => setCustomLongitude(e.target.value)}
                    />
                  </div>
                )}

                {correctionPreview && (
                  <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                    예상 보정: 약 {correctionPreview.correctionMinutes > 0 ? '+' : ''}{correctionPreview.correctionMinutes}분
                    {' '}({String(correctionPreview.originalHour).padStart(2, '0')}:{String(correctionPreview.originalMinute).padStart(2, '0')} → {String(correctionPreview.correctedHour).padStart(2, '0')}:{String(correctionPreview.correctedMinute).padStart(2, '0')})
                  </div>
                )}
              </div>
            )}
          </div>

          {!hideSubmit && (
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? '분석 중...' : '분석하기'}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
