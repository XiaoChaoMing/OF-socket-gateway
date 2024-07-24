/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { Mygateway } from './gateway';
import { MessagesService } from 'src/modules/message/message.service';
import { PrismaService } from './../prisma/prisma.service';
import { CommentService } from 'src/modules/comment/comment.service';
import { NotifyService } from 'src/modules/notify/notify.service';
import { ReactionService } from 'src/modules/reaction/reaction.service';
@Module({
  providers: [
    Mygateway,
    MessagesService,
    PrismaService,
    CommentService,
    NotifyService,
    ReactionService,
  ],
})
export class GatewayModule {}
