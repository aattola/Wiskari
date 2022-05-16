import axios, { AxiosRequestConfig } from 'axios';
import * as vega from 'vega';
import { MessageAttachment } from 'discord.js';
import sharp from 'sharp';
import { sub, parseISO } from 'date-fns';
import NodeCache from 'node-cache';
import { Asema, AsemaReport } from '../types/tankkiTypes';

const cache = new NodeCache({
  stdTTL: 600,
});

type AccessCache = {
  data: {
    accessToken: string;
  };
  lastFetch: number;
};

const spec: any = {
  $schema: 'https://vega.github.io/schema/vega/v5.json',
  description:
    'A basic bar chart example, with value labels shown upon mouse hover.',
  width: 400,
  height: 200,
  padding: 5,
  data: [
    {
      name: 'table',
      values: [
        { category: 1, amount: 28 },
        { category: 2, amount: 55 },
        { category: 3, amount: 43 },
        { category: 4, amount: 91 },
        { category: 5, amount: 81 },
        { category: 6, amount: 53 },
        { category: 7, amount: 19 },
        { category: 8, amount: 87 },
      ],
    },
  ],
  signals: [
    {
      name: 'tooltip',
      value: {},
      on: [
        { events: 'rect:mouseover', update: 'datum' },
        { events: 'rect:mouseout', update: '{}' },
      ],
    },
  ],
  scales: [
    {
      name: 'xscale',
      type: 'band',
      domain: { data: 'table', field: 'category' },
      range: 'width',
      padding: 0.05,
      round: true,
    },
    {
      name: 'yscale',
      domain: { data: 'table', field: 'amount' },
      nice: true,
      zero: true,
      range: 'height',
      minDomain: 1.0,
    },
  ],
  axes: [
    { orient: 'bottom', scale: 'xscale' },
    { orient: 'left', scale: 'yscale' },
  ],
  marks: [
    {
      type: 'rect',
      from: { data: 'table' },
      encode: {
        enter: {
          x: { scale: 'xscale', field: 'category' },
          width: { scale: 'xscale', band: 1 },
          y: { scale: 'yscale', field: 'amount' },
          y2: { scale: 'yscale', value: 0 },
        },
        update: { fill: { value: 'steelblue' } },
        hover: { fill: { value: 'red' } },
      },
    },
    {
      type: 'text',
      encode: {
        enter: {
          align: { value: 'center' },
          baseline: { value: 'bottom' },
          fill: { value: '#333' },
        },
        update: {
          x: { scale: 'xscale', signal: 'tooltip.category', band: 0.5 },
          y: { scale: 'yscale', signal: 'tooltip.amount', offset: -2 },
          text: { signal: 'tooltip.amount' },
          fillOpacity: [{ test: 'datum === tooltip', value: 0 }, { value: 1 }],
          fontSize: 12,
        },
      },
    },
  ],
  config: {
    background: '#333',
    title: { color: '#fff', subtitleColor: '#fff' },
    style: { 'guide-label': { fill: '#fff' }, 'guide-title': { fill: '#fff' } },
    axis: { domainColor: '#fff', gridColor: '#888', tickColor: '#fff' },
  },
};

class Tankille {
  tokenCache: AccessCache = {
    lastFetch: 0,
    data: <any>{},
  };

  accessToken: unknown;

  protected static instance: Tankille;

  static getInstance(): Tankille {
    if (!Tankille.instance) {
      Tankille.instance = new Tankille();
    }

    return Tankille.instance;
  }

  private async getAccessToken(): Promise<string> {
    const tankille = process.env.tankilleAccount;
    if (!tankille) {
      throw new Error('Haloo missä on tankilleAccount env token');
    }
    const data = {
      device: 'Android SDK built for x86_64 (03280ceb8a5367a6)',
      email: tankille.split(':')[0],
      password: tankille.split(':')[1],
    };

    const config: AxiosRequestConfig<typeof data> = {
      method: 'post',
      url: 'https://api.tankille.fi/auth/login',
      headers: {
        'User-Agent':
          'FuelFellow/3.6.2 (Android SDK built for x86_64; Android 9)',
        Host: 'api.tankille.fi',
      },
      data,
    };

    const res = await axios(config);

    if (!res.data.refreshToken) {
      console.log(res.data);
      throw new Error('Ei refresh tokenia responsessa');
    }

    return res.data.refreshToken;
  }

  private async refreshAuth(refreshToken: unknown): Promise<string> {
    const timeSinceLastFetch = Date.now() - this.tokenCache.lastFetch;
    // 10 tunnin cache accesstokenille (vanhenee 12 tunnissa)
    if (timeSinceLastFetch <= 36000) {
      return this.tokenCache.data.accessToken;
    }

    const data = {
      token: refreshToken,
    };

    const config: AxiosRequestConfig<typeof data> = {
      method: 'post',
      url: 'https://api.tankille.fi/auth/refresh',
      headers: {
        'User-Agent':
          'FuelFellow/3.6.2 (Android SDK built for x86_64; Android 9)',
        'Content-Type': 'application/json',
      },
      data,
    };

    const res = await axios(config);

    if (!res.data.accessToken) {
      throw new Error(res.data);
    }

    this.tokenCache = {
      lastFetch: Date.now(),
      data: res.data,
    };
    return res.data.accessToken;
  }

  private async authenticate(): Promise<string> {
    if (!this.accessToken) {
      this.accessToken = await this.getAccessToken();
    }

    const token = await this.refreshAuth(this.accessToken);
    return token;
  }

  public async getGasPriceHistory(stationId: string): Promise<AsemaReport[]> {
    const value = cache.get<AsemaReport[]>(stationId);
    if (value !== undefined) return value;

    const token = await this.authenticate();

    const date = sub(new Date(), {
      days: 14,
    });

    const since = date;
    const station = stationId || '57468337076757d9a7acf610';
    const res = await axios.get<AsemaReport[]>(
      `https://api.tankille.fi/stations/${station}/prices?since=${since}`,
      {
        headers: {
          'x-access-token': token,
        },
      }
    );

    if (!res.data) {
      throw new Error('aseman historiaa ei löytynyt');
    }

    const uniikkiTest: string[] = [];
    const hintadata: AsemaReport[] = [];

    res.data.forEach((report) => {
      const date1 = parseISO(report.timestamp);
      const dString = `${date1.getUTCFullYear()}-${date1.getUTCMonth()}-${date1.getUTCDate()}`;
      const a = report.prices.filter((filt) => filt.tag === '95')[0];
      if (!a) return;
      if (uniikkiTest.includes(dString)) return;
      uniikkiTest.push(dString);

      hintadata.push(report);
    });

    cache.set(stationId, hintadata);

    return hintadata;
  }

  public async generateGraph(stationId: string): Promise<MessageAttachment> {
    const prices = await this.getGasPriceHistory(stationId);

    prices.forEach((report, index) => {
      const price = report.prices.filter((a) => a.tag === '95')[0].value;
      const date = `${parseISO(report.timestamp).getUTCDate()}.${parseISO(
        report.timestamp
      ).getUTCMonth()}`;

      spec.data[0].values[index] = {
        category: date,
        amount: price,
      };
    });

    const runtime = vega.parse(spec);
    const view = new vega.View(runtime, { renderer: 'none' });

    const svg = await view.toSVG();
    const outputBuff = await sharp(Buffer.from(svg), { density: 300 })
      .png()
      .toBuffer();
    return new MessageAttachment(
      outputBuff,
      'Kaavio jeffe and co trademark.png'
    );
  }

  public async getGasPrices(): Promise<Asema[]> {
    const value = cache.get<Asema[]>('gasPrices');
    if (value !== undefined) return value;

    const token = await this.authenticate();

    const res = await axios.get<Asema[]>(
      'https://api.tankille.fi/stations?location=23.993%2C61.492&distance=15000',
      {
        headers: {
          'x-access-token': token,
        },
      }
    );

    if (!res.data) {
      throw new Error('Asemia ei löytynyt');
    }
    cache.set('gasPrices', res.data);
    return res.data;
  }
}

export { Tankille };
