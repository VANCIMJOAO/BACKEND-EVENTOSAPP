import { UsersService } from './users.service';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EventDto } from '../events/dto/event.dto';
export declare class UsersController {
    private readonly usersService;
    private readonly logger;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<UserProfileDto>;
    updateProfile(req: any, updateData: CompleteProfileDto): Promise<UserProfileDto>;
    getUserById(id: string, req: any): Promise<UserProfileDto>;
    updateUser(id: string, updateData: UpdateUserDto): Promise<UserProfileDto>;
    toggleFavorite(req: any, eventId: string): Promise<UserProfileDto>;
    getFavorites(req: any): Promise<EventDto[]>;
    checkFavoriteStatus(req: any, eventId: string): Promise<{
        isFavorited: boolean;
    }>;
    addFriend(req: any, friendId: string): Promise<UserProfileDto>;
    removeFriend(req: any, friendId: string): Promise<UserProfileDto>;
    getMyFriends(req: any): Promise<UserProfileDto[]>;
    getUserFriends(id: string): Promise<UserProfileDto[]>;
    updatePrivacy(req: any, body: {
        isPrivate: boolean;
    }): Promise<UserProfileDto>;
    getGoingEvents(req: any): Promise<EventDto[]>;
    updateExpoPushToken(req: any, body: {
        expoPushToken: string;
    }): Promise<any>;
}
