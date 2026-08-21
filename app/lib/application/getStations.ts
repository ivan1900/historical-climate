import Station from '../domain/station';
import updateStations from '../infrastructure/updateStations';

type StationData = {
  indicativo: string;
  altitud: string;
  nombre: string;
  latitud: string;
  longitud: string;
};

export default async function getStations() {
  const stationsURL = await preFetchStations();
  const stationsResponse = await fetch(stationsURL, {
    method: 'GET',
    headers: {
      api_key: process.env.AEMET_API_KEY || '',
    },
  });

  const buffer = await stationsResponse.arrayBuffer();
  const stationsData = JSON.parse(new TextDecoder('iso-8859-1').decode(buffer));
  const stations = stationsData.map((station: StationData) =>
    Station.createStation(
      station.indicativo,
      station.altitud,
      station.nombre,
      station.latitud,
      station.longitud,
    ),
  );
  await updateStations(stations);
}

async function preFetchStations() {
  const URL = `${process.env.BASE_URL}/api/valores/climatologicos/inventarioestaciones/todasestaciones`;
  const preResponse = await fetch(URL, {
    method: 'GET',
    headers: {
      api_key: process.env.AEMET_API_KEY || '',
    },
  });

  if (!preResponse.ok) {
    throw new Error(`Error fetching stations: ${preResponse.statusText}`);
  }

  const data = await preResponse.json();
  const stationsURL = data.datos;
  return stationsURL;
}
