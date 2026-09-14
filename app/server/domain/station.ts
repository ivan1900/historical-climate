export default class Station {
  private idema: string;
  private altitude: string;
  private name: string;
  private latitude: string;
  private longitude: string;

  constructor(idema: string, altitude: string, name: string, latitude: string, longitude: string) {
    this.idema = idema;
    this.altitude = altitude;
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  static createStation(
    idema: string,
    altitude: string,
    name: string,
    latitude: string,
    longitude: string,
  ): Station {
    return new Station(idema, altitude, name, latitude, longitude);
  }
}
