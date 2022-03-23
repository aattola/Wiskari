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
interface Asema {
  address: AsemaOsoite;
  location: AsemaLocation;
  fuels: string[];
  _id: string;
  name: string;
  chain: string;
  brand: string;
  price: AsemaHinta[];
  __v: number;
  updated: string;
}

export { Asema, Tankille };
