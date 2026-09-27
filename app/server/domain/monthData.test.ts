import { describe, expect, it } from 'vitest';

import MonthData from './monthData';

describe('MonthData.createMonthData', () => {
  it('builds a UTC date for the first day of a regular month', () => {
    const monthData = MonthData.createMonthData('1234', 1, 10, 5.5, 2024, 3, 12, 4, 0);

    expect(monthData.getDate()).toEqual(new Date(Date.UTC(2024, 2, 1)));
    expect(monthData.getIsYearStatistics()).toBe(false);
  });

  it('marks month 13 as annual statistics dated Dec 31 in UTC', () => {
    const monthData = MonthData.createMonthData('1234', 1, 10, 5.5, 2024, 13, 12, 4, 0);

    expect(monthData.getIsYearStatistics()).toBe(true);
    expect(monthData.getDate()).toEqual(new Date(Date.UTC(2024, 11, 31)));
  });
});

describe('MonthData.toDTO', () => {
  it('maps every field', () => {
    const monthData = MonthData.createMonthData('idema-1', -2, 18, 8.4, 2023, 7, 3.2, 5, 1);

    expect(monthData.toDTO()).toEqual({
      idema: 'idema-1',
      tempMin: -2,
      tempMax: 18,
      tempAvg: 8.4,
      date: new Date(Date.UTC(2023, 6, 1)),
      isYearStatistics: false,
      rainfall: 3.2,
      rainDays: 5,
      snowDays: 1,
    });
  });

  it('preserves null values', () => {
    const monthData = MonthData.createMonthData(
      'idema-2',
      null,
      null,
      null,
      2023,
      2,
      null,
      null,
      null,
    );

    expect(monthData.toDTO()).toEqual({
      idema: 'idema-2',
      tempMin: null,
      tempMax: null,
      tempAvg: null,
      date: new Date(Date.UTC(2023, 1, 1)),
      isYearStatistics: false,
      rainfall: null,
      rainDays: null,
      snowDays: null,
    });
  });
});
