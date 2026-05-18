import { IGiftRepository } from './IGiftRepository';
import { GiftItem } from '../../domain/entities/GiftItem';
import { GiftList } from '../../domain/entities/GiftList';

const mockList: GiftList = {
    id: 'mock-list-1',
    motherName: 'María García',
    eventDate: new Date('2026-06-15'),
    shareCode: 'maria-x4k2',
    ownerId: 'temp-owner',
    createdAt: new Date(),
    totalItems: 4,
    boughtItems: 1,
};

const mockItems: GiftItem[] = [
    {
        id: '1',
        name: 'Coche para bebé',
        description: 'Color neutro preferiblemente',
        estimatedPrice: 350000,
        quantityNeeded: 1,
        status: 'available',
        listId: 'mock-list-1',
    },
    {
        id: '2',
        name: 'Kit de ropa 0-3 meses',
        description: 'Talla newborn y 0-3 meses',
        estimatedPrice: 120000,
        quantityNeeded: 1,
        status: 'reserved',
        reservedBy: 'Tía Claudia',
        listId: 'mock-list-1',
    },
    {
        id: '3',
        name: 'Bañera para bebé',
        description: '',
        estimatedPrice: 85000,
        quantityNeeded: 1,
        status: 'bought',
        reservedBy: 'Abuela Rosa',
        listId: 'mock-list-1',
    },
    {
        id: '4',
        name: 'Monitor de bebé',
        description: 'Con cámara si es posible',
        estimatedPrice: 250000,
        quantityNeeded: 1,
        status: 'available',
        listId: 'mock-list-1',
    },
];

export class MockGiftRepository implements IGiftRepository {
    private items = [...mockItems];

    async createList(list: Omit<GiftList, 'id' | 'createdAt'>): Promise<GiftList> {
        return { ...list, id: 'mock-new', createdAt: new Date() };
    }

    async getListByShareCode(shareCode: string): Promise<GiftList | null> {
        if (shareCode === mockList.shareCode) return mockList;
        return null;
    }

    async getListsByOwner(ownerId: string): Promise<GiftList[]> {
        return [mockList];
    }

    async getItemsByList(listId: string): Promise<GiftItem[]> {
        return this.items;
    }

    async addItem(item: Omit<GiftItem, 'id'>): Promise<GiftItem> {
        const newItem = { ...item, id: Date.now().toString() };
        this.items.push(newItem);
        return newItem;
    }

    async updateItem(itemId: string, data: Partial<GiftItem>): Promise<void> {
        this.items = this.items.map(i => i.id === itemId ? { ...i, ...data } : i);
    }

    async deleteItem(itemId: string): Promise<void> {
        this.items = this.items.filter(i => i.id !== itemId);
    }

    async reserveItem(itemId: string, reservedBy: string): Promise<{ success: boolean; message: string }> {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return { success: false, message: 'Artículo no encontrado' };
        if (item.status !== 'available') {
            return { success: false, message: 'Ups, alguien más se adelantó con este regalo' };
        }
        await this.updateItem(itemId, { status: 'reserved', reservedBy, reservedAt: new Date() });
        return { success: true, message: 'Regalo reservado exitosamente' };
    }

    async markAsBought(itemId: string): Promise<void> {
        await this.updateItem(itemId, { status: 'bought', boughtAt: new Date() });
    }

    subscribeToList(listId: string, callback: (items: GiftItem[]) => void): () => void {
        callback(this.items);
        return () => { };
    }
}
