/* eslint-disable prettier/prettier */

import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CommentService } from 'src/modules/comment/comment.service';
import { MessagesService } from 'src/modules/message/message.service';
import { NotifyService } from 'src/modules/notify/notify.service';
import { ReactionService } from 'src/modules/reaction/reaction.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
  },
})
export class Mygateway implements OnModuleInit {
  constructor(
    private readonly msgService: MessagesService,
    private readonly cmtService: CommentService,
    private readonly notifyService: NotifyService,
    private readonly reactionService: ReactionService,
  ) {}
  @WebSocketServer()
  server: Server;
  private userSocketMap = new Map<number, string>();

  onModuleInit() {
    this.server.on('connection', (socket: Socket) => {
      console.log(`Socket connected: ${socket.id}`);

      socket.on('register', (userId: string) => {
        this.userSocketMap.set(Number(userId), socket.id);
        console.log(`User ${userId} connected with socket ID ${socket.id}`);
        console.log(this.userSocketMap);
      });
      socket.on('initiate-call', ({ fromUser, toUserId }) => {
        const toUserSocketId = this.userSocketMap.get(toUserId);
        if (toUserSocketId) {
          this.server.to(toUserSocketId).emit('incoming-call', { fromUser });
        }
      });
      socket.on('call-response', ({ accepted, toUserId }) => {
        const toUserSocketId = this.userSocketMap.get(toUserId);
        if (toUserSocketId) {
          this.server.to(toUserSocketId).emit('call-response', { accepted });
        }
      });
      socket.on('call-user', ({ fromUserId, toUserId }) => {
        const toUserSocketId = this.userSocketMap.get(toUserId);
        if (toUserSocketId) {
          this.server.to(toUserSocketId).emit('isCalling', { fromUserId });
        } else {
          console.log(`User ${toUserId} is not online`);
        }
      });
      socket.on('cancel-call', ({ fromUserId, toUserId }) => {
        const toUserSocketId = this.userSocketMap.get(toUserId);
        if (toUserSocketId) {
          this.server.to(toUserSocketId).emit('rejectCall', { fromUserId });
        } else {
          console.log(`User ${toUserId} is not online`);
        }
      });
      socket.on('end-call', ({ fromUserId, toUserId }) => {
        const toUserSocketId = this.userSocketMap.get(toUserId);
        if (toUserSocketId) {
          this.server.to(toUserSocketId).emit('shutDown', { fromUserId });
        } else {
          console.log(`User ${toUserId} is not online`);
        }
      });
      socket.on('accept', ({ fromUserId, toUserId }) => {
        const toUserSocketId = this.userSocketMap.get(toUserId);
        if (toUserSocketId) {
          this.server.to(toUserSocketId).emit('accept-call', { fromUserId });
        } else {
          console.log(`User ${fromUserId} is not online`);
        }
      });
      socket.on('offer', (data) => {
        const toUserSocketId = this.userSocketMap.get(data.toUserId);
        if (toUserSocketId) {
          console.log(toUserSocketId, data.toUserId);
          this.server.to(toUserSocketId).emit('offer', data);
        }
      });
      socket.on('answer', (data) => {
        const toUserSocketId = this.userSocketMap.get(data.toUserId);
        if (toUserSocketId) {
          this.server.to(toUserSocketId).emit('answer', data);
        }
      });
      socket.on('ice-candidate', (data) => {
        const toUserSocketId = this.userSocketMap.get(data.toUserId);

        if (toUserSocketId) {
          this.server.to(toUserSocketId).emit('ice-candidate', data);
        }
      });
      socket.on('disconnect', () => {
        console.log(`Client ${socket.id} has disconnected.`);
        console.log(this.server.sockets.adapter.rooms.get('room 2'));
        for (const [userId, id] of this.userSocketMap.entries()) {
          if (id === socket.id) {
            this.userSocketMap.delete(userId);
            console.log(`User ${userId} removed from map.`);

            break;
          }
        }
      });
      socket.on('joinRoom', ({ room, userId }) => {
        socket.join(room);
        console.log(`user ${userId} joint room ${room}`);
        console.log(this.server.sockets.adapter.rooms.get(room));
      });
      socket.on('leaveRoom', ({ room, userId }) => {
        socket.leave(room);
        console.log(`user ${userId} leave room ${room}`);
        console.log(this.server.sockets.adapter.rooms.get(room));
      });
    });
  }

  @SubscribeMessage('sendMessage')
  async onNewMessage(@MessageBody() body: any) {
    const { uid, friendId, content, files } = body;
    this.msgService.sendMessage(uid, friendId, content, files);
    const toUserSocketId = this.userSocketMap.get(friendId);
    if (!toUserSocketId) console.log('offline');
    this.server.to(toUserSocketId).emit('receiveMessage', {
      msg: 'new message',
      content: body,
    });
  }

  @SubscribeMessage('pendingMessage')
  async onPending(@MessageBody() body: any) {
    console.log(body);
    const { friendId } = body;
    const toUserSocketId = this.userSocketMap.get(friendId);
    if (!toUserSocketId) console.log('offline');
    this.server.to(toUserSocketId).emit('pendingMsg');
  }
  @SubscribeMessage('createdComment')
  async onComment(@MessageBody() body: any) {
    const { commentText, userId, postId } = body;
    const newComment = await this.cmtService.createComment(
      commentText,
      userId,
      postId,
    );
    this.server.emit('newComment', {
      msg: 'new message',
      content: newComment,
    });
  }

  @SubscribeMessage('replyCmt')
  async onReplyCmt(@MessageBody() body: any) {
    const { parentCommentId, ReplyById, replyText } = body;
    const newReply = await this.cmtService.createReply(
      parentCommentId,
      ReplyById,
      replyText,
    );

    this.server.emit('newReply', {
      msg: 'new message',
      content: newReply,
    });
  }

  @SubscribeMessage('createNotify')
  async onCreateNotify(@MessageBody() body: any) {
    const { notifyTypeId, userId, fromUserId, ...contents } = body;
    const newNotify = await this.notifyService.createNotify(
      notifyTypeId,
      userId,
      fromUserId,
      contents.contents,
    );

    if (!newNotify) return null;
    const notify = await this.notifyService.getLatedNotifyByUserId(fromUserId);
    if (parseInt(notifyTypeId) === 1) {
      const loadListFollower =
        await this.notifyService.getFollowerList(fromUserId);

      const onlineFollowers = loadListFollower.filter((follower) => {
        return this.userSocketMap.has(follower.folowerId);
      });

      const onlineFollowerSocketIds = onlineFollowers.map((follower) =>
        this.userSocketMap.get(follower.folowerId),
      );
      // post notify
      this.server.to(onlineFollowerSocketIds).emit('newNotify', {
        msg: 'new notify',
        content: notify,
      });
    } else if (parseInt(notifyTypeId) === 3 || 6) {
      // comment notify
      const toUserSocketId = this.userSocketMap.get(userId);
      this.server.to(toUserSocketId).emit('newNotify', {
        msg: 'new notify',
        content: notify,
      });
    }
  }

  @SubscribeMessage('reactPost')
  async reactPost(@MessageBody() body: any) {
    const { postId, userId } = body;
    const newReact = await this.reactionService.reactionPost(postId, userId);
    const getUserByPostId =
      await this.reactionService.findUserCreatePost(postId);
    const toUserSocketId = this.userSocketMap.get(getUserByPostId.userId);
    this.server.to(toUserSocketId).emit('newReact', {
      msg: 'new react',
      content: newReact,
    });
    if (!newReact) return false;
    return true;
  }

  @SubscribeMessage('streamInit')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async stream(@MessageBody() body: any) {}
}
