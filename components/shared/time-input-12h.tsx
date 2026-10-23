'use client';

import React, { useState } from 'react';
import { parse24To12, convert12To24, formatTime12Hour } from '@/lib/dates';
import { SlidersHorizontal, ListFilter } from 'lucide-react';

interface TimeInput12HProps {
  value: string; // 24h string (e.g. "09:30", "14:00")
  onChange: (value24: string) => void;
  required?: boolean;
  className?: string;
  id?: string;
  disabled?: boolean;
}

// Generate all 15-minute intervals across 24 hours (12:00 AM to 11:45 PM)
const PRESET_TIME_SLOTS: { value: string; label: string }[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 15) {
    const val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    PRESET_TIME_SLOTS.push({
      value: val,
      label: formatTime12Hour(val),
    });
  }
}

export function TimeInput12H({
  value,
  onChange,
  required,
  className = '',
  id,
  disabled = false,
}: TimeInput12HProps) {
  const [isGranularMode, setIsGranularMode] = useState<boolean>(false);
  const normalizedValue = value ? value.slice(0, 5) : '09:00';
  const { hour, minute, period } = parse24To12(normalizedValue);

  // Minutes list for granular mode
  const standardMinutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
  const minuteList = standardMinutes.includes(minute)
    ? standardMinutes
    : [...standardMinutes, minute].sort((a, b) => parseInt(a) - parseInt(b));

  // Ensure current value is in preset list
  const isPresentInSlots = PRESET_TIME_SLOTS.some((s) => s.value === normalizedValue);
  const slots = isPresentInSlots
    ? PRESET_TIME_SLOTS
    : [...PRESET_TIME_SLOTS, { value: normalizedValue, label: `${formatTime12Hour(normalizedValue)} (Custom)` }].sort(
        (a, b) => a.value.localeCompare(b.value)
      );

  const handleHourChange = (newHour: string) => {
    onChange(convert12To24(newHour, minute, period));
  };

  const handleMinuteChange = (newMinute: string) => {
    onChange(convert12To24(hour, newMinute, period));
  };

  const handlePeriodChange = (newPeriod: 'AM' | 'PM') => {
    onChange(convert12To24(hour, minute, newPeriod));
  };

  return (
    <div
      id={id}
      className={`inline-flex items-center gap-1.5 p-1 rounded-lg border border-paper-300 dark:border-paper-700 bg-white dark:bg-paper-800 text-ink-900 dark:text-ink-100 ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      } ${className}`}
    >
      {!isGranularMode ? (
        /* Primary 12-Hour Dropdown Selector */
        <div className="relative flex-1 min-w-[120px]">
          <select
            value={normalizedValue}
            disabled={disabled}
            required={required}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Select time in 12-hour format"
            className="w-full appearance-none bg-transparent pl-2.5 pr-6 py-1 text-xs font-semibold text-ink-900 dark:text-ink-100 focus:outline-none cursor-pointer rounded hover:bg-paper-100 dark:hover:bg-paper-700/60"
          >
            {slots.map((s) => (
              <option
                key={s.value}
                value={s.value}
                className="bg-white dark:bg-paper-900 text-ink-900 dark:text-ink-100"
              >
                {s.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-ink-400">
            ▾
          </span>
        </div>
      ) : (
        /* Granular Hour / Minute / AM-PM Picker */
        <div className="flex items-center gap-1.5">
          {/* Hour Dropdown */}
          <div className="relative">
            <select
              value={hour}
              disabled={disabled}
              required={required}
              onChange={(e) => handleHourChange(e.target.value)}
              aria-label="Hour (12-hour format)"
              className="appearance-none bg-transparent pl-2 pr-4 py-1 text-xs font-semibold text-ink-900 dark:text-ink-100 focus:outline-none cursor-pointer rounded hover:bg-paper-100 dark:hover:bg-paper-700/60"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                const val = String(h).padStart(2, '0');
                return (
                  <option key={val} value={val} className="bg-white dark:bg-paper-900 text-ink-900 dark:text-ink-100">
                    {val}
                  </option>
                );
              })}
            </select>
            <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-ink-400">▾</span>
          </div>

          <span className="text-ink-400 font-bold text-xs select-none">:</span>

          {/* Minute Dropdown */}
          <div className="relative">
            <select
              value={minute}
              disabled={disabled}
              required={required}
              onChange={(e) => handleMinuteChange(e.target.value)}
              aria-label="Minute"
              className="appearance-none bg-transparent pl-2 pr-4 py-1 text-xs font-semibold text-ink-900 dark:text-ink-100 focus:outline-none cursor-pointer rounded hover:bg-paper-100 dark:hover:bg-paper-700/60"
            >
              {minuteList.map((m) => (
                <option key={m} value={m} className="bg-white dark:bg-paper-900 text-ink-900 dark:text-ink-100">
                  {m}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-ink-400">▾</span>
          </div>

          {/* AM / PM Segmented Toggle */}
          <div className="inline-flex rounded-md border border-paper-200 dark:border-paper-700 overflow-hidden text-[10px] font-bold shadow-2xs">
            <button
              type="button"
              disabled={disabled}
              onClick={() => handlePeriodChange('AM')}
              className={`px-2 py-1 transition-all ${
                period === 'AM'
                  ? 'bg-forest text-white'
                  : 'bg-paper-50 dark:bg-paper-900 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
              }`}
            >
              AM
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => handlePeriodChange('PM')}
              className={`px-2 py-1 transition-all ${
                period === 'PM'
                  ? 'bg-forest text-white'
                  : 'bg-paper-50 dark:bg-paper-900 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
              }`}
            >
              PM
            </button>
          </div>
        </div>
      )}

      {/* Mode Switcher Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsGranularMode(!isGranularMode)}
        title={isGranularMode ? 'Switch to time slot dropdown' : 'Fine-tune exact hour and minute'}
        className="p-1 rounded text-ink-400 hover:text-forest dark:hover:text-emerald-400 hover:bg-paper-100 dark:hover:bg-paper-700/60 transition-colors"
      >
        {isGranularMode ? (
          <ListFilter className="w-3.5 h-3.5" />
        ) : (
          <SlidersHorizontal className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
