import { prisma } from '../db';
import { normalize } from '../domain/normalize';

export type InMemoryStation = {
  value: string;
  label: string;
  normalized: string;
};

const globalForStations = globalThis as unknown as {
  stations?: InMemoryStation[];
};

export async function getAllStations(): Promise<InMemoryStation[]> {
  if (globalForStations.stations) {
    return globalForStations.stations;
  }

  const rows = await prisma.stations.findMany({
    select: { idema: true, name: true },
  });

  const stations = rows
    .filter((station): station is { idema: string; name: string } =>
      Boolean(station.idema && station.name),
    )
    .map((station) => ({
      value: station.idema,
      label: station.name,
      normalized: normalize(station.name),
    }));

  globalForStations.stations = stations;

  return stations;
}
