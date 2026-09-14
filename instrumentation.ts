import fetchAemetStations from './app/server/application/fetchAemetStations';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await fetchAemetStations();
  }
}
