export type MonthDataDTO = {
  idema: string;
  tempMin: number;
  tempMax: number;
  tempAvg: number;
  date: Date;
  isYearStatistics: boolean;
  rainfall: number;
  rainDays: number;
  snowDays: number;
};

export default class MonthData {
  private idema: string;
  private tempMin: number;
  private tempMax: number;
  private tempAvg: number;
  private date: Date;
  private isYearStatistics: boolean;
  private rainfall: number;
  private rainDays: number;
  private snowDays: number;

  constructor(
    idema: string,
    tempMin: number,
    tempMax: number,
    tempAvg: number,
    date: Date,
    isYearStatistics: boolean,
    rainfall: number,
    rainDays: number,
    snowDays: number,
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
    tempMin: number,
    tempMax: number,
    tempAvg: number,
    year: number,
    month: number,
    rainfall: number,
    rainDays: number,
    snowDays: number,
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

  getTempMin(): number {
    return this.tempMin;
  }

  getTempMax(): number {
    return this.tempMax;
  }

  getTempAvg(): number {
    return this.tempAvg;
  }

  getDate(): Date {
    return this.date;
  }

  getIsYearStatistics(): boolean {
    return this.isYearStatistics;
  }

  getRainfall(): number {
    return this.rainfall;
  }

  getRainDays(): number {
    return this.rainDays;
  }

  getSnowDays(): number {
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
