export type GiftStatus = 'available' | 'reserved' | 'bought';

export interface GiftItem {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    estimatedPrice: number;
    quantityNeeded: number;
    status: GiftStatus;
    reservedBy?: string;
    reservedAt?: Date;
    boughtAt?: Date;
    listId: string;
}
