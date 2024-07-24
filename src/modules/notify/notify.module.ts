/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';

import { Mygateway } from 'src/gateway/gateway';
import { NotifyService } from './notify.service';

@Module({
  imports: [PrismaModule],
  providers: [NotifyService, Mygateway],
  exports: [NotifyService],
})
export class NotifyModule {}
