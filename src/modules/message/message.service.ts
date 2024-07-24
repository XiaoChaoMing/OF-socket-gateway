/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(
    fromUserId: string,
    toUserId: string,
    message: string,
    files: string,
  ) {
    const exitUser = await this.prisma.users.findFirst({
      where: {
        id: parseInt(toUserId),
      },
    });
    if (!exitUser) return null;
    const newMsg = await this.prisma.messages.create({
      data: {
        fromUserId: parseInt(fromUserId),
        toUserId: parseInt(toUserId),
        messageText: message,
        messMedia: files,
      },
    });
    return newMsg;
  }
}
