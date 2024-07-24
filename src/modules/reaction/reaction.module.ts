/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';

import { Mygateway } from 'src/gateway/gateway';
import { ReactionService } from './reaction.service';

@Module({
  imports: [PrismaModule],
  providers: [ReactionService, Mygateway],
  exports: [ReactionService],
})
export class CommentModule {}
