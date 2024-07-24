/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async createComment(commentText: string, userId: string, postId: string) {
    const exitPost = await this.prisma.posts.findFirst({
      where: {
        id: parseInt(postId),
      },
    });
    if (!exitPost) return null;
    const newComment = await this.prisma.comments.create({
      include: {
        Users: true,
        _count: true,
      },
      data: {
        userId: parseInt(userId),
        postId: parseInt(postId),
        commentText: commentText,
      },
    });
    return newComment;
  }

  async createReply(
    parentCommentId: string,
    ReplyById: string,
    replyText: string,
  ) {
    const exitCmt = await this.prisma.comments.findFirst({
      where: {
        id: parseInt(parentCommentId),
      },
    });
    if (!exitCmt) return null;
    const newComment = await this.prisma.cmtReply.create({
      include: {
        ById: true,
      },
      data: {
        parentCommentId: parseInt(parentCommentId),
        ReplyById: parseInt(ReplyById),
        replyText: replyText,
      },
    });
    return newComment;
  }
}
