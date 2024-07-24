/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GatewayModule } from './gateway/gateway.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [GatewayModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
