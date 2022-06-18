import axios from 'axios';
import { AlkoSearchResults, AlkoStoreStock } from '../types/Alko';

const STOCK_API_FOR_THAT_ONE_DRINK =
  'https://mobile-api.alko.fi/v1/availability/929092?lang=fi';
const SEARCH_API = 'https://mobile-api.alko.fi/v1/products/search?lang=fi';

export async function searchAlko(
  searchQuery: string,
  searchResults = 5
): Promise<AlkoSearchResults[]> {
  const res = await axios.post<{
    value: AlkoSearchResults[];
  }>(
    SEARCH_API,
    {
      top: searchResults,
      skip: 0,
      orderby: 'random',
      seed: Math.random(),
      freeText: searchQuery,
    },
    {
      headers: {
        'x-api-key': process.env.alkoApiKey!,
      },
    }
  );

  const { data } = res;

  return data.value;
}

export async function getAlkoStockById(id: string): Promise<AlkoStoreStock[]> {
  const res = await axios.get<AlkoStoreStock[]>(
    `https://mobile-api.alko.fi/v1/availability/${id}?lang=fi`,
    {
      headers: {
        'x-api-key': process.env.alkoApiKey!,
      },
    }
  );

  const { data } = res;

  return data;
}

export async function getAlkoStock() {
  const res = await axios.get<AlkoStoreStock[]>(STOCK_API_FOR_THAT_ONE_DRINK, {
    headers: {
      'x-api-key': process.env.alkoApiKey!,
    },
  });

  const { data } = res;

  return data;
}
