import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';

@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule {}
