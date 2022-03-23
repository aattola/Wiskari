import axios, { AxiosRequestConfig } from 'axios';
import { Asema } from '../types/tankkiTypes';

type AccessCache = {
  data: {
    accessToken: string;
  };
  lastFetch: number;
};

class Tankille {
  tokenCache: AccessCache = {
    lastFetch: 0,
    data: <any>{},
  };

  accessToken: string = null;

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

  private async refreshAuth(refreshToken: string): Promise<string> {
    const timeSinceLastFetch = Date.now() - this.tokenCache.lastFetch;
    // 1 * 2 viikon cache tokeneille jne
    if (timeSinceLastFetch <= 86400000) {
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

  public async getGasPrices(): Promise<Asema[]> {
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
    return res.data;
  }
}

export { Tankille };
