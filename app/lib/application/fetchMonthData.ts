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
) {
  const monthDataURL = await preFetchMonthData(anioInitStr, anioFinStr, idema);
  const monthDataResponse = await fetch(monthDataURL, {
    method: 'GET',
    headers: {
      api_key: process.env.AEMET_API_KEY || '',
    },
  });

  const buffer = await monthDataResponse.arrayBuffer();
  const monthData = JSON.parse(new TextDecoder('iso-8859-1').decode(buffer));
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

async function preFetchMonthData(anioInitStr: string, anioFinStr: string, idema: string) {
  const URL = `${process.env.BASE_URL}/api/valores/climatologicos/mensualesanuales/datos/anioini/${anioInitStr}/aniofin/${anioFinStr}/estacion/${idema}`;
  const preResponse = await fetch(URL, {
    method: 'GET',
    headers: {
      api_key: process.env.AEMET_API_KEY || '',
    },
  });

  if (!preResponse.ok) {
    throw new Error(`Error fetching month data: ${preResponse.statusText}`);
  }

  const data = await preResponse.json();
  const monthDataURL = data.datos;
  return monthDataURL;
}

function parseNumber(value: string): number {
  if (!value) {
    return 0;
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
