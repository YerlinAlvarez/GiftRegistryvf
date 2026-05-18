import { IGiftRepository } from './IGiftRepository';
import { FirebaseGiftDataSource } from '../datasources/FirebaseGiftDataSource';
import { GiftItem } from '../../domain/entities/GiftItem';
import { GiftList } from '../../domain/entities/GiftList';

export class GiftRepositoryImpl implements IGiftRepository {
    constructor(
        private dataSource: FirebaseGiftDataSource = new FirebaseGiftDataSource()
    ) {}

    createList(list: Omit<GiftList, 'id' | 'createdAt'>) {
        return this.dataSource.createList(list);
    }

    getListByShareCode(shareCode: string) {
        return this.dataSource.getListByShareCode(shareCode);
    }

    getListsByOwner(ownerId: string) {
        return this.dataSource.getListsByOwner(ownerId);
    }

    getItemsByList(listId: string) {
        return this.dataSource.getItemsByList(listId);
    }

    addItem(item: Omit<GiftItem, 'id'>) {
        return this.dataSource.addItem(item);
    }

    updateItem(itemId: string, data: Partial<GiftItem>) {
        return this.dataSource.updateItem(itemId, data);
    }

    deleteItem(itemId: string) {
        return this.dataSource.deleteItem(itemId);
    }

    reserveItem(itemId: string, reservedBy: string) {
        return this.dataSource.reserveItem(itemId, reservedBy);
    }

    markAsBought(itemId: string) {
        return this.dataSource.markAsBought(itemId);
    }

    subscribeToList(listId: string, callback: (items: GiftItem[]) => void) {
        return this.dataSource.subscribeToList(listId, callback);
    }

}
