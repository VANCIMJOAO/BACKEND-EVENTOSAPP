import { User } from '../user.entity';
export declare enum FriendRequestStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED"
}
export declare class FriendRequest {
    id: number;
    sender: User;
    receiver: User;
    status: FriendRequestStatus;
    createdAt: Date;
}
