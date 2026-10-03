import 'dotenv/config';

export async function register() {
  try {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      const { default: fetchAemetStations } =
        await import('./app/server/application/fetchAemetStations');
      await fetchAemetStations();
    }
  } catch (error) {
    console.error('Error registering instrumentation:', error);
  }
}
