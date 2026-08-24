import fetchAemetStations from './app/lib/application/getStations';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await fetchAemetStations();
  }
}
