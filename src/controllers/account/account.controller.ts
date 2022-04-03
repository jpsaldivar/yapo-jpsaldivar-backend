import {
  BadRequestException,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Query,
  Body,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';

@Controller('/account')
export class AccountController {
  constructor() {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() input: any): any {
    if (input === undefined || input === null || input === '') {
      throw new BadRequestException({
        message: 'Params required',
      });
    }

    if (input.username === 'yapo' && input.password === '123456') {
      return {
        message: 'Success login',
        token: uuid(),
      };
    }

    throw new BadRequestException({
      message: 'User not authorized',
    });
  }
}
