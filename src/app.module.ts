import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccountController } from './controllers/account/account.controller';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';

@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  controllers: [AppController, AccountController],
  providers: [AppService, ConfigService],
})
export class AppModule {}
