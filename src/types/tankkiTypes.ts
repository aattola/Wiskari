type Tankille = Asema[];
interface AsemaOsoite {
  street: string;
  city: string;
  zipcode: string;
  country: string;
}
interface AsemaLocation {
  type: string;
  coordinates: number[];
}
interface AsemaHinta {
  updated: string;
  tag: string;
  price: number;
  delta: number;
  reporter: string;
  _id: string;
}

type Fuels =
  | '95'
  | '98'
  | 'dsl'
  | 'ngas'
  | 'bgas'
  | '98+'
  | 'dsl+'
  | '85'
  | 'hvo';

interface Asema {
  address: AsemaOsoite;
  location: AsemaLocation;
  fuels: Fuels[];
  _id: string;
  name: string;
  chain: string;
  brand: string;
  price: AsemaHinta[];
  __v: number;
  updated: string;
}

export interface AsemaNormalized extends Asema {
  95: number | false;
  diesel: number | false;
}

interface AsemaReport {
  _id: string;
  stationId: string;
  userId: string;
  timestamp: string;
  prices: AsemaReportPrice[];
  __v: number;
}
interface AsemaReportPrice {
  _id: string;
  tag: string;
  value: number;
}

export { Asema, Tankille, AsemaReport };
