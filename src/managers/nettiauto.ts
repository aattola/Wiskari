import { Message, MessageEmbed } from 'discord.js';
import axios from 'axios';
import qs from 'qs';
import { NettiautoListing } from './nettiautoTypes';
import { Sentry } from '../logging/sentry';

type AccessCache = {
  data: {
    access_token: string;
    expires_in: number;
    token_type: 'bearer';
    scope: 'read';
  };
  lastFetch: number;
};

class Nettiauto {
  tokenCache: AccessCache = {
    lastFetch: 0,
    data: <any>{},
  };

  async getAccessToken(): Promise<AccessCache | null> {
    const timeSinceLastFetch = Date.now() - this.tokenCache.lastFetch;
    // 12 tunnin cache tokeneille jne
    if (timeSinceLastFetch <= 43200000) {
      return this.tokenCache;
    }

    const data = qs.stringify({
      grant_type: 'client_credentials',
      scope: 'read',
    });

    const config: any = {
      method: 'POST',
      url: 'https://auth.nettix.fi/oauth2/token',
      headers: {
        Host: 'auth.nettix.fi',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data,
    };

    const res = await axios(config);
    if (!res.data) return null;
    this.tokenCache = {
      lastFetch: Date.now(),
      data: res.data,
    };
    return this.tokenCache;
  }

  async fetchCarInfo(adId: string): Promise<NettiautoListing | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    const axiosResponse = await axios.get(
      `https://api.nettix.fi/rest/car/ad/${adId}`,
      {
        headers: {
          'x-access-token': token.data.access_token,
        },
      }
    );

    return axiosResponse.data;
  }

  parseUrl(url: string): string | null {
    if (!url.includes('https://www.nettiauto.com/')) return null;
    const osat = url.split('/');
    if (osat.length !== 6) return null;
    return osat[osat.length - 1];
  }

  sendResponse(car: NettiautoListing, message: Message) {
    Sentry.addBreadcrumb({
      category: 'nettiauto',
      message: `Uusi nettiauto: ${message.content} ${message.id} ${message.author.username} ${message.author.id}`,
      level: Sentry.Severity.Info,
      data: car,
    });

    const price = new Intl.NumberFormat('fi-FI').format(car.price);
    const kilometers = new Intl.NumberFormat('fi-FI').format(car.kilometers);
    let power = `${car.power}`;

    if (car.powerUnitIsKw) {
      const hp = new Intl.NumberFormat('fi-FI', {
        maximumSignificantDigits: 3,
      }).format(car.power * 1.35);

      power = `${car.power} kW / ${hp} Hv`;
    } else {
      const kw = new Intl.NumberFormat('fi-FI', {
        maximumSignificantDigits: 3,
      }).format(car.power * 0.745699872);

      power = `${kw} kW / ${car.power} Hv`;
    }

    const embed = new MessageEmbed()
      .setColor('#e14343')
      .setTitle(`${car.make.name} ${car.model.name} ${car.year}`)
      .setDescription(`${car.modelType ? car.modelType.name : ''} ${price}€`)
      .setURL(car.adUrl)
      .addFields(
        {
          name: 'Teho',
          value: car.power ? `${power}` : 'Ei ilm.',
          inline: true,
        },
        {
          name: 'Huippunopeus',
          value: `${car.topSpeed ? `${car.topSpeed} km/h` : 'Ei ilm.'} `,
          inline: true,
        },
        { name: 'Mittarilukema', value: `${kilometers} km`, inline: true },
        { name: 'Vetotapa', value: `${car.driveType.fi}`, inline: true },
        { name: 'Vaihteisto', value: `${car.gearType.fi}`, inline: true },
        {
          name: 'Sijainti',
          value: `${car.town.fi} ${car.region.fi}`,
          inline: true,
        }
      )
      .setImage(car.images[0].medium.url)
      .setTimestamp()
      .setFooter({ text: 'Laadukas Nettiautobotti' });

    if (car.engineSize && car.fuelType?.fi) {
      embed.addField(
        'Moottori',
        `${car.engineSize} l, ${car.fuelType.fi}`,
        true
      );
    }

    if (
      car.steeringWheelLeft === false &&
      car.make.name.toLowerCase().includes('subaru')
    ) {
      embed.setThumbnail(
        'https://i.kym-cdn.com/photos/images/facebook/002/018/642/644.png'
      );
    }

    if (
      car.make.name.toLowerCase().includes('honda') &&
      car.kilometers > 400000
    ) {
      embed.addField('Pitkään ajettu.', `Ruoste tässä haisee.`, true);
    }

    if (car.make.name.toLowerCase().includes('honda')) {
      embed.addField(
        'Japanilainen auto.',
        `Mieti tarkkaan ennen kun harkitset muita autoja`,
        true
      );
    }

    if (
      car.make.name.toLowerCase().includes('mercedes-benz') &&
      car.kilometers > 400000
    ) {
      embed.addField(
        'Romu mikä romu.',
        `Miten tää ruostekasa edes liikkuu?`,
        true
      );
    }

    if (car.model.name.toLowerCase().includes('fiesta')) {
      embed.addField('Hyvä valinta.', `Laadukas auto`, true);
    }

    if (car.steeringWheelLeft === false) {
      embed.addField(
        'Ohjauslaite',
        `OIKEALLA HEI SE ON OIKEALLA HERÄÄ SIIS TÄH???`,
        true
      );
    }

    message
      .reply({
        embeds: [embed],
      })
      .catch((err) => {
        Sentry.captureException(err, {
          tags: { type: 'nettiauto' },
        });
      });
  }

  async onMessage(message: Message) {
    const parsed = this.parseUrl(message.content);
    if (!parsed) return;
    const car = await this.fetchCarInfo(parsed);
    if (!car) return;
    this.sendResponse(car, message);
  }
}

export { Nettiauto };
