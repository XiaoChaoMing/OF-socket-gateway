/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReactionService {
  constructor(private prisma: PrismaService) {}
  async reactionPost(postId: string, userId: string) {
    try {
      const exitsPost = await this.exitsPost(postId);
      if (exitsPost) {
        const exitReact = await this.exitsReact(postId, userId);
        if (exitReact) {
          await this.prisma.reactions.delete({
            where: {
              id: exitReact?.id,
            },
          });
          return 0;
        }
        const react = await this.prisma.reactions.create({
          data: {
            postId: parseInt(postId),
            userId: parseInt(userId),
          },
        });
        return react;
      }
    } catch (error) {
      console.log(error);
    }
  }
  async exitsPost(postId: string) {
    try {
      const exitsPost = await this.prisma.posts.findFirst({
        where: {
          id: parseInt(postId),
        },
      });
      if (!exitsPost) return null;
      return exitsPost;
    } catch (error) {
      console.log(error);
    }
  }
  async exitsReact(postId: string, userId: string) {
    const exitsReact = await this.prisma.reactions.findFirst({
      where: {
        AND: [{ postId: parseInt(postId) }, { userId: parseInt(userId) }],
      },
    });
    if (!exitsReact) return null;
    return exitsReact;
  }
  async findUserCreatePost(postId: string) {
    try {
      const userId = await this.prisma.posts.findFirst({
        where: {
          id: parseInt(postId),
        },
        select: {
          userId: true,
        },
      });
      return userId;
    } catch (error) {
      console.log(error);
    }
  }
}
