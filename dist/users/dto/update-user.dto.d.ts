import { UserRole } from './user-role.enum';
export declare class UpdateUserDto {
    nickname?: string;
    isPrivate?: boolean;
    role?: UserRole;
}
