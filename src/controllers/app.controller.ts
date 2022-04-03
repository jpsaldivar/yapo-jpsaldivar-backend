import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { AppService } from '../services/app.service';

@Controller('/')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/search_tracks')
  @HttpCode(HttpStatus.OK)
  getTracks(@Query('name') bandName: string): any {
    if (bandName === undefined || bandName === null || bandName === '') {
      throw new BadRequestException({
        message: 'Param name is required',
      });
    }
    return this.appService.getThemes(bandName);
  }
}
