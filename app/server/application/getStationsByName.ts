import { normalize } from '../domain/normalize';
import { getAllStations } from '../infrastructure/stationsInMemory';

export type StationSuggestion = {
  value: string;
  label: string;
};

const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 10;

export default async function getStationsByName(query: string): Promise<StationSuggestion[]> {
  const trimmed = query.trim();

  if (trimmed.length < MIN_QUERY_LENGTH) {
    return [];
  }

  const allStations = await getAllStations();
  const normalizedQuery = normalize(trimmed);

  return allStations
    .filter((station) => station.normalized.includes(normalizedQuery))
    .slice(0, MAX_RESULTS)
    .map(({ value, label }) => ({ value, label }));
}
