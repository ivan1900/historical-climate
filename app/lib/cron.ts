import prisma from './db';

const JOB_INTERVAL_MS = 6 * 60 * 60 * 1000; // cada 6h, por ejemplo

export function startCron() {
  console.log('⏰ Cron iniciado');

  const run = async () => {
    try {
      console.log('⏳ Ejecutando tarea programada...');
    } catch (err) {
      console.error('Cron error:', err);
    }
  };

  run(); // ejecución inicial (opcional)
  setInterval(run, JOB_INTERVAL_MS);
}
