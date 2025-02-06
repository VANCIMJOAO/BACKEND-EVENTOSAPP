import { Repository, DataSource } from 'typeorm';
import { FriendRequest } from './friend-request.entity';
import { User } from '../user.entity';
import { NotificationsService } from '../../notifications/notifications.service';
import { RealtimeGateway } from '../../realtime/realtime.gateway';
export declare class FriendRequestsService {
    private friendRequestRepo;
    private userRepo;
    private notificationsService;
    private dataSource;
    private realtimeGateway;
    constructor(friendRequestRepo: Repository<FriendRequest>, userRepo: Repository<User>, notificationsService: NotificationsService, dataSource: DataSource, realtimeGateway: RealtimeGateway);
    createRequest(senderId: number, receiverId: number): Promise<FriendRequest>;
    getReceivedRequests(userId: number): Promise<FriendRequest[]>;
    acceptRequest(requestId: number, userId: number): Promise<FriendRequest>;
    rejectRequest(requestId: number, userId: number): Promise<FriendRequest>;
}
