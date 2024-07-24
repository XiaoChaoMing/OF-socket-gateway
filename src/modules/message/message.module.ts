/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MessagesService } from './message.service';
import { Mygateway } from 'src/gateway/gateway';

@Module({
  imports: [PrismaModule],
  providers: [MessagesService, Mygateway],
  exports: [MessagesService],
})
export class MessagesModule {}
