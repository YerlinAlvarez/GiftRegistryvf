import { GiftItem } from '../../domain/entities/GiftItem';
import { GiftList } from '../../domain/entities/GiftList';

export class SQLiteGiftCacheDataSource {

  async upsertList(_: GiftList): Promise<void> {}

  async getListByShareCode(_: string): Promise<GiftList | null> {
    return null;
  }

  async upsertItems(_: string, __: GiftItem[]): Promise<void> {}

  async getItemsByList(_: string): Promise<GiftItem[]> {
    return [];
  }

  async deleteItem(_: string): Promise<void> {}
}