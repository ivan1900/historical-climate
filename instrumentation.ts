import fetchAemetStations from './app/lib/application/fetchAemetStations';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await fetchAemetStations();
  }
}
