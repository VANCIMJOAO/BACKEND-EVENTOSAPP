import { FriendRequestsService } from './friend-requests.service';
export declare class FriendRequestsController {
    private readonly frService;
    constructor(frService: FriendRequestsService);
    createRequest(req: any, receiverId: string): Promise<import("./friend-request.entity").FriendRequest>;
    getReceived(req: any): Promise<{
        id: number;
        type: string;
        message: string;
        data: {
            friendRequestId: number;
        };
        createdAt: Date;
        status: import("./friend-request.entity").FriendRequestStatus;
        sender: {
            id: number;
            nickname: string;
            avatar: string;
        };
    }[]>;
    acceptRequest(req: any, requestId: string): Promise<import("./friend-request.entity").FriendRequest>;
    rejectRequest(req: any, requestId: string): Promise<import("./friend-request.entity").FriendRequest>;
}
