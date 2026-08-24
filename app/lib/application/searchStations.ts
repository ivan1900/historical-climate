'use server';

import getStationsByName, { type StationSuggestion } from './getStationsByName';

export type { StationSuggestion };

export async function searchStations(query: string): Promise<StationSuggestion[]> {
  return getStationsByName(query);
}
