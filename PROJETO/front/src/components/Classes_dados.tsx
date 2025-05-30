export interface GeoJSONGeometry {
    type: string;
    coordinates: unknown;
  }
 
  export class Queimada {
    id: number = 0;
    geom: GeoJSONGeometry = { type: '', coordinates: null };
    DataHora: Date = new Date();
    Satellite: string = '';
    Pais: string = '';
    Estado: string = '';
    Municipio: string = '';
    Bioma: string = '';
    DiaSemChuva: number = 0;
    Precipitacao: number = 0;
    RiscoFogo: number = 0;
    Latitude: number = 0;
    Longitude: number = 0;
    FRP: number = 0;
 
    constructor(data: Partial<Queimada>) {
      Object.assign(this, data);
    }
  }
 