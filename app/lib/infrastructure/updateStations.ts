import { prisma } from '../db';
import Station from '../domain/station';

export default async function updateStations(stations: Station[]) {
  const totalCurrentStations = await prisma.stations.count();

  if (totalCurrentStations >= stations.length) {
    console.log(
      `No se actualizaron las estaciones, ya que la cantidad actual (${totalCurrentStations}) es mayor o igual a la cantidad obtenida de AEMET (${stations.length}).`,
    );
    return;
  }

  await prisma.stations.deleteMany();
  await prisma.stations.createMany({
    data: stations.map((station) => ({
      idema: station['idema'],
      altitude: station['altitude'],
      name: station['name'],
      latitude: station['latitude'],
      longitude: station['longitude'],
    })),
  });

  console.log(
    `Se actualizaron las estaciones, se eliminaron ${totalCurrentStations} y se insertaron ${stations.length}.`,
  );
}
