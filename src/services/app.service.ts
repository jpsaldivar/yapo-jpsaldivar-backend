import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  SongDto,
  TracksResponseDto,
} from '../entities/responses/tracks-response.dto';
import * as redis from 'redis';

const prefixRedis = 'yapo';

@Injectable()
export class AppService {
  private redisClient;
  constructor(private http: HttpService, private configService: ConfigService) {
    this.redisClient = redis.createClient({
      socket: {
        port: configService.get<number>('REDIS_PORT'),
        host: configService.get<string>('REDIS_HOST'),
        tls: false,
      },
      password: configService.get<string>('REDIS_PASSWORD'),
    });

    this.redisClient.connect();
    this.redisClient.on('error', function (error: any) {
      console.log(
        `Error ON redisClient ${JSON.stringify(
          error.response?.data ? error.response.data : error,
        )}`,
        error.stack,
      );
    });
  }

  async getFromCache(key: string): Promise<any> {
    const keySession = `${prefixRedis}:apple:${key}`;
    const value = await this.redisClient.get(keySession, (error) => {
      if (error) {
        console.log(
          `Error get from cache ${JSON.stringify(
            error.response?.data ? error.response.data : error,
          )}`,
        );
      }
    });
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  async addToCache(key: string, info: any): Promise<string> {
    try {
      console.log(`Creating cache ${prefixRedis}:apple:${key}`);
      await this.redisClient.set(
        `${prefixRedis}:apple:${key}`,
        JSON.stringify(info),
        { ttl: Number(this.configService.get('REDIS_TTL')) },
        (error) => {
          if (error) {
            console.log(
              `Error set to cache ${JSON.stringify(
                error.response?.data ? error.response.data : error,
              )}`,
            );
          }
        },
      );
      return key;
    } catch (e) {
      console.log(`Error setting cache ${e}`);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }

  async getThemes(bandName: string): Promise<TracksResponseDto> {
    try {
      //First get form cache
      const element = await this.getFromCache(bandName);
      if (
        element &&
        element !== undefined &&
        element !== null &&
        element !== ''
      ) {
        console.log('Exist in cache');
        return element as TracksResponseDto;
      }

      //If not in cache, get from API
      const url = 'https://itunes.apple.com/search';
      const queryUrl = `${url}?term=${bandName}`;
      const query = await firstValueFrom(this.http.get(queryUrl));
      const elements = query?.data?.results;

      const albums: string[] = [];
      const songs: SongDto[] = [];
      let i = 0;
      elements.every((item) => {
        if (item.artistName === bandName) {
          i++;
          albums.push(item.collectionName);
          songs.push({
            cancion_id: `${item.collectionId}-${i}`,
            nombre_album: item.collectionName,
            nombre_tema: item.trackName,
            preview_url: item.previewUrl,
            fecha_lanzamiento: item.releaseDate,
            precio: {
              valor: item.collectionPrice,
              moneda: item.currency,
            },
          });
        }
        if (songs.length >= 25) {
          return false;
        }
        return true;
      });

      const uniqueAlbums = albums.filter(
        (item, i, ar) => ar.indexOf(item) === i,
      );

      const response = {
        total_albumes: uniqueAlbums.length,
        total_canciones: songs.length,
        albumes: uniqueAlbums,
        canciones: songs,
      } as TracksResponseDto;

      this.addToCache(bandName, response);

      return response;
    } catch (e) {
      console.log(e);
      throw new BadRequestException({
        message: 'Error',
      });
    }
  }
}
