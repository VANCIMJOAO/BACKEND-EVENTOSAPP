import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FriendRequestsService } from './friend-requests.service';

@UseGuards(AuthGuard('jwt'))
@Controller('friend-requests')
export class FriendRequestsController {
  constructor(private readonly frService: FriendRequestsService) {}

  @Post(':receiverId')
  createRequest(@Request() req, @Param('receiverId') receiverId: string) {
    return this.frService.createRequest(req.user.id, Number(receiverId));
  }

  @Get('received')
  async getReceived(@Request() req) {
    console.log('🔹 Buscando solicitações de amizade para:', req.user.id);
    const requests = await this.frService.getReceivedRequests(req.user.id);

    return requests.map((request) => ({
      id: request.id,
      type: 'FRIEND_REQUEST',
      message: `${request.sender.nickname} enviou uma solicitação de amizade.`,
      data: { friendRequestId: request.id }, // ✅ GARANTE QUE 'data' SEMPRE EXISTA
      createdAt: request.createdAt,
      status: request.status,
      sender: {
        id: request.sender.id,
        nickname: request.sender.nickname,
        avatar: request.sender.avatar,
      },
    }));
  }

  @Patch(':requestId/accept')
  acceptRequest(@Request() req, @Param('requestId') requestId: string) {
    return this.frService.acceptRequest(Number(requestId), req.user.id);
  }

  @Patch(':requestId/reject')
  rejectRequest(@Request() req, @Param('requestId') requestId: string) {
    return this.frService.rejectRequest(Number(requestId), req.user.id);
  }
}
