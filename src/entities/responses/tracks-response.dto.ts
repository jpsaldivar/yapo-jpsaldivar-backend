import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsString,
} from 'class-validator';

export class TracksResponseDto {
    @IsNumber()
    readonly total_albumes : number;
    @IsNumber()
    readonly total_canciones : number;
    @IsString()
    @IsArray()
    readonly albumes : string[];

    @IsArray()
    @Type(() => SongDto)
    readonly canciones : SongDto[];
}

export class SongDto {
  @IsString()
  readonly cancion_id: string;

  @IsString()
  readonly nombre_album: string;

  @IsString()
  readonly nombre_tema: string;

  @IsString()
  readonly preview_url: string;

  @IsString()
  readonly fecha_lanzamiento: string;

  @Type(() => PriceSongDto)
  readonly precio: PriceSongDto;

}

export class PriceSongDto {
    @IsNumber()
    readonly valor: number;
    
    @IsString()
    readonly moneda: string;
}
