import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAllStations } from '../infrastructure/stationsInMemory';
import getStationsByName from './getStationsByName';

vi.mock('../infrastructure/stationsInMemory', () => ({
  getAllStations: vi.fn(),
}));

const mockedGetAllStations = vi.mocked(getAllStations);

type StationFixture = { value: string; label: string; normalized: string };

function stationFixture(label: string, value = label): StationFixture {
  return { value, label, normalized: label.toLowerCase() };
}

describe('getStationsByName', () => {
  beforeEach(() => {
    mockedGetAllStations.mockReset();
    mockedGetAllStations.mockResolvedValue([]);
  });

  it('returns [] for a trimmed query shorter than 2 chars', async () => {
    const result = await getStationsByName(' a ');

    expect(result).toEqual([]);
    expect(mockedGetAllStations).not.toHaveBeenCalled();
  });

  it('returns matches for a 2-char or longer query', async () => {
    mockedGetAllStations.mockResolvedValue([stationFixture('Madrid'), stationFixture('Avila')]);

    const result = await getStationsByName('mad');

    expect(result).toEqual([{ value: 'Madrid', label: 'Madrid' }]);
  });

  it('matches in an accent-insensitive way via the normalized field', async () => {
    mockedGetAllStations.mockResolvedValue([
      { value: '0061', label: 'Almería', normalized: 'almeria' },
    ]);

    const result = await getStationsByName('almeria');

    expect(result).toEqual([{ value: '0061', label: 'Almería' }]);
  });

  it('caps results at 10', async () => {
    mockedGetAllStations.mockResolvedValue(
      Array.from({ length: 12 }, (_, index) => stationFixture(`Madrid-${index}`, `id-${index}`)),
    );

    const result = await getStationsByName('madrid');

    expect(result).toHaveLength(10);
  });

  it('returns suggestions with the { value, label } shape', async () => {
    mockedGetAllStations.mockResolvedValue([
      { value: '0061', label: 'Almería', normalized: 'almeria' },
    ]);

    const result = await getStationsByName('almeria');

    expect(result[0]).toEqual({ value: '0061', label: 'Almería' });
    expect(Object.keys(result[0])).toEqual(['value', 'label']);
  });
});
