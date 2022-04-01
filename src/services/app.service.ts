import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(private http: HttpService) {}
  
  getHello(): string {
    return 'Hello World!';
  }

  async getThemes(bandName: string) : Promise<any>{

    try{

      const url = 'https://itunes.apple.com/search';
      const queryUrl = `${url}?term=${bandName}`;
      const query = await firstValueFrom( this.http.get(queryUrl));
      const elements = query?.data?.results;

      const albums : any[] = [];
      const songs : any[] = [];
      elements.every(item => {
        if(item.artistName === bandName){
          albums.push(item.collectionName);
          songs.push(
            { 
              'cancion_id': item.collectionId,
              'nombre_album': item.collectionName,
              'nombre_tema': item.trackName,
              'preview_url' : item.previewUrl,
              'fecha_lanzamiento': item.releaseDate

            }
          );
        }
        if(songs.length >= 25){
          return false;
        }
        return true;
      });

      const uniqueAlbums = albums.filter((item, i, ar) => ar.indexOf(item) === i);

      const response = {	
        'total_albumes': uniqueAlbums.length,
        'total_canciones': songs.length,
        'albumes': uniqueAlbums,
        'canciones': songs
      };

      return { response };

    }catch(e){
      throw new BadRequestException({
        message: 'Error'
      });
    }
    
    
  }
}
