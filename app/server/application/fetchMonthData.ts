import { Decimal } from 'decimal.js';

import MonthData from '../domain/monthData';
import updateMonthData from '../infrastructure/updateMonthData';

type monthDataDTO = {
  indicativo: string;
  tm_min: string;
  tm_max: string;
  tm_mes: string;
  p_mes: string;
  n_llu: string;
  n_nie: string;
  fecha: string;
};

export default async function fetchMonthData(
  anioInitStr: string,
  anioFinStr: string,
  idema: string,
): Promise<MonthData[]> {
  const monthDataURL = await preFetchMonthData(anioInitStr, anioFinStr, idema);
  const monthDataResponse = await fetch(monthDataURL, {
    method: 'GET',
    headers: {
      api_key: process.env.AEMET_API_KEY || '',
    },
  });

  if (!monthDataResponse.ok) {
    throw new Error(
      `Error fetching AEMET month data for ${anioInitStr}-${anioFinStr} (station ${idema}): HTTP ${monthDataResponse.status} ${monthDataResponse.statusText}`,
    );
  }

  const buffer = await monthDataResponse.arrayBuffer();
  const raw = JSON.parse(new TextDecoder('iso-8859-1').decode(buffer));
  const monthData = Array.isArray(raw) ? raw : [];
  const data = monthData.map((month: monthDataDTO) =>
    MonthData.createMonthData(
      month.indicativo,
      parseNumber(month.tm_min),
      parseNumber(month.tm_max),
      parseNumber(month.tm_mes),
      parseYear(month.fecha),
      parseMonth(month.fecha),
      parseNumber(month.p_mes),
      parseNumber(month.n_llu),
      parseNumber(month.n_nie),
    ),
  );
  await updateMonthData(data);
  return data;
}

type AemetPrefetchResponse = {
  datos: string;
  estado: number;
  descripcion: string;
};

async function preFetchMonthData(
  anioInitStr: string,
  anioFinStr: string,
  idema: string,
): Promise<string> {
  const URL = `${process.env.BASE_URL}/api/valores/climatologicos/mensualesanuales/datos/anioini/${anioInitStr}/aniofin/${anioFinStr}/estacion/${idema}`;
  const preResponse = await fetch(URL, {
    method: 'GET',
    headers: {
      api_key: process.env.AEMET_API_KEY || '',
    },
  });

  if (!preResponse.ok) {
    throw new Error(
      `Error requesting AEMET month data for ${anioInitStr}-${anioFinStr} (station ${idema}): HTTP ${preResponse.status} ${preResponse.statusText}`,
    );
  }

  const data = (await preResponse.json()) as AemetPrefetchResponse;

  if (!data.datos) {
    throw new Error(
      `AEMET returned no data URL for ${anioInitStr}-${anioFinStr} (station ${idema}). Estado: ${data.estado}. ${data.descripcion}`,
    );
  }

  return data.datos;
}

function parseNumber(value: string): number | null {
  if (!value) {
    return null;
  }
  const decimalValue = new Decimal(value);
  return decimalValue.toNumber();
}

function parseYear(fecha: string): number {
  return Number(fecha.slice(0, 4));
}

function parseMonth(fecha: string): number {
  return Number(fecha.slice(5, 7));
}
