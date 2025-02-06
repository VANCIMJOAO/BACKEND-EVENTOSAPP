import { EventDto } from '../../events/dto/event.dto';
export declare class UserProfileDto {
    id: number;
    email: string;
    nickname: string;
    avatar?: string;
    description?: string;
    interests?: string[];
    isProfileComplete: boolean;
    role: string;
    sex?: string;
    birthDate?: string;
    phone?: string;
    favoriteEvents: EventDto[];
    isPrivate: boolean;
}
