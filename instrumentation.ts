import 'dotenv/config';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { default: fetchAemetStations } =
      await import('./app/server/application/fetchAemetStations');
    await fetchAemetStations();
  }
}
