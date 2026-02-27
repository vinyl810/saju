'use client';

import * as React from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ComboSelectOption {
  value: string;
  label: string;
}

interface ComboSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: ComboSelectOption[];
  min?: number;
  max?: number;
  id?: string;
  placeholder?: string;
}

export function ComboSelect({
  value,
  onValueChange,
  options,
  min,
  max,
  id,
  placeholder,
}: ComboSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const listRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // 현재 선택된 옵션의 label 가져오기
  const selectedLabel = React.useMemo(
    () => options.find((o) => o.value === value)?.label ?? placeholder ?? '',
    [options, value, placeholder],
  );

  // 필터된 옵션
  const filteredOptions = React.useMemo(() => {
    if (!inputValue) return options;
    return options.filter(
      (o) =>
        o.value.includes(inputValue) || o.label.includes(inputValue),
    );
  }, [options, inputValue]);

  // 팝업 열릴 때: input 초기화, 현재 선택 항목으로 스크롤
  React.useEffect(() => {
    if (open) {
      setInputValue('');
      setHighlightedIndex(-1);

      // 열릴 때 현재 선택 항목으로 스크롤
      requestAnimationFrame(() => {
        if (listRef.current) {
          const selected = listRef.current.querySelector(
            '[data-selected="true"]',
          );
          if (selected) {
            selected.scrollIntoView({ block: 'nearest' });
          }
        }
        inputRef.current?.focus();
      });
    }
  }, [open]);

  // 클램핑 및 확정 처리
  const commitValue = React.useCallback(
    (raw: string) => {
      const num = parseInt(raw, 10);
      if (isNaN(num)) return;

      let clamped = num;
      if (min !== undefined && clamped < min) clamped = min;
      if (max !== undefined && clamped > max) clamped = max;

      // 옵션 목록에 있는 값으로 매칭
      const match = options.find((o) => parseInt(o.value, 10) === clamped);
      if (match) {
        onValueChange(match.value);
      }
    },
    [min, max, options, onValueChange],
  );

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev,
        );
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredOptions.length
        ) {
          handleSelect(filteredOptions[highlightedIndex].value);
        } else if (inputValue) {
          commitValue(inputValue);
          setOpen(false);
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        setOpen(false);
        break;
      }
    }
  };

  // 하이라이트된 항목 자동 스크롤
  React.useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.querySelector(
        `[data-index="${highlightedIndex}"]`,
      );
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  // inputValue 변경 시 하이라이트 리셋
  React.useEffect(() => {
    setHighlightedIndex(-1);
  }, [inputValue]);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          id={id}
          className={cn(
            'border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*=text-])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <span className="line-clamp-1">{selectedLabel}</span>
          <ChevronDownIcon className="size-4 opacity-50 shrink-0" />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className={cn(
            'bg-popover text-popover-foreground z-50 min-w-[var(--radix-popover-trigger-width)] origin-(--radix-popover-content-transform-origin) overflow-hidden rounded-md border shadow-md',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* 입력 필드 */}
          <div className="p-1.5">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              className="h-8 w-full rounded-sm border-0 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
              placeholder="숫자 입력..."
              value={inputValue}
              onChange={(e) => {
                // 숫자만 허용
                const v = e.target.value.replace(/[^0-9]/g, '');
                setInputValue(v);
              }}
              onBlur={() => {
                if (inputValue) {
                  commitValue(inputValue);
                }
              }}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* 구분선 */}
          <div className="h-px bg-border" />

          {/* 옵션 리스트 */}
          <div
            ref={listRef}
            className="max-h-[200px] overflow-y-auto p-1"
            role="listbox"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                결과 없음
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = index === highlightedIndex;
                return (
                  <div
                    key={option.value}
                    data-index={index}
                    data-selected={isSelected}
                    role="option"
                    aria-selected={isSelected}
                    className={cn(
                      'relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-8 pl-2 text-sm select-none',
                      isHighlighted && 'bg-accent text-accent-foreground',
                      !isHighlighted &&
                        'hover:bg-accent hover:text-accent-foreground',
                    )}
                    onPointerDown={(e) => {
                      e.preventDefault(); // input blur 방지
                      handleSelect(option.value);
                    }}
                  >
                    {option.label}
                    {isSelected && (
                      <span className="absolute right-2 flex size-3.5 items-center justify-center">
                        <CheckIcon className="size-4" />
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
