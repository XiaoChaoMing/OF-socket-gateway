/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';

import { Mygateway } from 'src/gateway/gateway';
import { CommentService } from './comment.service';

@Module({
  imports: [PrismaModule],
  providers: [CommentService, Mygateway],
  exports: [CommentService],
})
export class CommentModule {}
