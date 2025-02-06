export declare class CreateEventDto {
    name: string;
    description: string;
    coverImage?: string;
    categories: string[];
    latitude?: number;
    longitude?: number;
    placeName: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    address: string;
    isFree: boolean;
    ticketPrice?: string;
    registrationStatus?: string;
}
