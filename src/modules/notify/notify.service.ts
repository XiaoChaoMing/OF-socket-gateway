/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotifyService {
  constructor(private prisma: PrismaService) {}

  async createNotify(
    notifyTypeId: string,
    userId: string | null,
    fromUserId: string,
    notiContent: any,
  ) {
    try {
      const exitUser = await this.exitUser(fromUserId);
      if (!exitUser) return null;
      if (parseInt(notifyTypeId) === 1) {
        const listFriends = await this.getFollowerList(fromUserId);
        const promiseNotify = listFriends.map(async (friend) => {
          return await this.prisma.notifies.create({
            data: {
              notifyTypeId: parseInt(notifyTypeId),
              userId: friend.folowerId,
              fromUserId: parseInt(fromUserId),
              notiContent: notiContent,
            },
          });
        });
        const sendNotifyDone = await Promise.all(promiseNotify);
        return sendNotifyDone;
      } else if (parseInt(notifyTypeId) === 3 || 6) {
        const newNotify = await this.prisma.notifies.create({
          data: {
            notifyTypeId: parseInt(notifyTypeId),
            userId: parseInt(userId),
            fromUserId: parseInt(fromUserId),
            notiContent: notiContent,
          },
        });
        return newNotify;
      }
    } catch (error) {
      console.log(error);
    }
  }
  async getLatedNotifyByUserId(userId: string) {
    try {
      const latedNotify = await this.prisma.notifies.findFirst({
        where: {
          fromUserId: parseInt(userId),
        },
        include: {
          Users_Notifies_fromUserIdToUsers: {
            select: {
              firstName: true,
              lastName: true,
              Avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      if (!latedNotify) return null;

      return latedNotify;
    } catch (error) {
      console.log(error);
    }
  }
  async exitUser(userId: string) {
    console.log();
    try {
      const exitUser = await this.prisma.users.findFirst({
        where: {
          id: parseInt(userId),
        },
      });
      if (!exitUser) null;
      return exitUser;
    } catch (error) {
      console.log(error);
    }
  }
  async getFollowerList(userId: string) {
    const listFollower = await this.prisma.followers.findMany({
      where: {
        followingId: parseInt(userId),
      },
    });
    if (!listFollower) null;
    return listFollower;
  }
}
