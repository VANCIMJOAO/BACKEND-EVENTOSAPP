import { EventInvitationsService } from './event-invitations.service';
export declare class EventInvitationsController {
    private readonly invitationsService;
    private readonly logger;
    constructor(invitationsService: EventInvitationsService);
    sendInvites(eventId: number, friendIds: number[], req: any): Promise<{
        message: string;
    }>;
    getUserInvitations(req: any): Promise<{
        id: number;
        type: string;
        message: string;
        data: {
            eventId: number;
            invitationId: number;
        };
        createdAt: Date;
        status: import("./event-invitation.entity").InvitationStatus;
        sender: {
            id: number;
            nickname: string;
            avatar: string;
        };
    }[]>;
    respondToInvitation(id: number, accept: boolean, req: any): Promise<{
        message: string;
    }>;
}
