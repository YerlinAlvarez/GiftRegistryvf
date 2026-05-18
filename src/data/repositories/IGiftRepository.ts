import { GiftItem } from '../../domain/entities/GiftItem';
import { GiftList } from '../../domain/entities/GiftList';

export interface IGiftRepository {
    createList(list: Omit<GiftList, 'id' | 'createdAt'>): Promise<GiftList>;
    getListByShareCode(shareCode: string): Promise<GiftList | null>;
    getListsByOwner(ownerId: string): Promise<GiftList[]>;

    getItemsByList(listId: string): Promise<GiftItem[]>;
    addItem(item: Omit<GiftItem, 'id'>): Promise<GiftItem>;
    updateItem(itemId: string, data: Partial<GiftItem>): Promise<void>;
    deleteItem(itemId: string): Promise<void>;

    reserveItem(itemId: string, reservedBy: string): Promise<{ success: boolean; message: string }>;
    markAsBought(itemId: string): Promise<void>;

    subscribeToList(listId: string, callback: (items: GiftItem[]) => void): () => void;
}
