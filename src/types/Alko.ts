export interface AlkoSearchResults {
  id: string;
  taste: string;
  additionalInfo: null;
  abv: number;
  countryName: string;
  mainGroupID: string[];
  name: string;
  price: number;
  productGroupID: string[];
  productGroupName: string[];
  tasteStyleID?: string[];
  tasteStyleName?: string[];
  tasteStyleRtdID?: string[];
  tasteStyleRtdName?: string[];
  volume: number;
  onlineAvailabilityDatetimeTs: number;
  description: string;
}

export interface AlkoStoreStock {
  id: string;
  count: string;
  availability: string;
  store: {
    id: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
    outletType: string;
    name: string;
    postalCode: string;
    openDays: {
      hours: string;
      date: string;
    }[];
  };
}
