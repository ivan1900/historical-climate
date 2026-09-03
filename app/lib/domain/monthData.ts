export type MonthDataDTO = {
  idema: string;
  tempMin: number | null;
  tempMax: number | null;
  tempAvg: number | null;
  date: Date;
  isYearStatistics: boolean;
  rainfall: number | null;
  rainDays: number | null;
  snowDays: number | null;
};

export default class MonthData {
  private idema: string;
  private tempMin: number | null;
  private tempMax: number | null;
  private tempAvg: number | null;
  private date: Date;
  private isYearStatistics: boolean;
  private rainfall: number | null;
  private rainDays: number | null;
  private snowDays: number | null;

  constructor(
    idema: string,
    tempMin: number | null,
    tempMax: number | null,
    tempAvg: number | null,
    date: Date,
    isYearStatistics: boolean,
    rainfall: number | null,
    rainDays: number | null,
    snowDays: number | null,
  ) {
    this.idema = idema;
    this.tempMin = tempMin;
    this.tempMax = tempMax;
    this.tempAvg = tempAvg;
    this.date = date;
    this.isYearStatistics = isYearStatistics;
    this.rainfall = rainfall;
    this.rainDays = rainDays;
    this.snowDays = snowDays;
  }

  static createMonthData(
    idema: string,
    tempMin: number | null,
    tempMax: number | null,
    tempAvg: number | null,
    year: number,
    month: number,
    rainfall: number | null,
    rainDays: number | null,
    snowDays: number | null,
  ): MonthData {
    return new MonthData(
      idema,
      tempMin,
      tempMax,
      tempAvg,
      buildDate(year, month),
      month === 13,
      rainfall,
      rainDays,
      snowDays,
    );
  }

  getIdema(): string {
    return this.idema;
  }

  getTempMin(): number | null {
    return this.tempMin;
  }

  getTempMax(): number | null {
    return this.tempMax;
  }

  getTempAvg(): number | null {
    return this.tempAvg;
  }

  getDate(): Date {
    return this.date;
  }

  getIsYearStatistics(): boolean {
    return this.isYearStatistics;
  }

  getRainfall(): number | null {
    return this.rainfall;
  }

  getRainDays(): number | null {
    return this.rainDays;
  }

  getSnowDays(): number | null {
    return this.snowDays;
  }

  toDTO(): MonthDataDTO {
    return {
      idema: this.idema,
      tempMin: this.tempMin,
      tempMax: this.tempMax,
      tempAvg: this.tempAvg,
      date: this.date,
      isYearStatistics: this.isYearStatistics,
      rainfall: this.rainfall,
      rainDays: this.rainDays,
      snowDays: this.snowDays,
    };
  }
}

function buildDate(year: number, month: number): Date {
  // AEMET uses month 13 to denote the annual statistics for the year.
  if (month === 13) {
    return new Date(year, 11, 31);
  }

  return new Date(year, month - 1, 1);
}
