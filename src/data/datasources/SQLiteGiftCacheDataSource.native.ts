import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { GiftItem } from '../../domain/entities/GiftItem';
import { GiftList } from '../../domain/entities/GiftList';

type GiftListRow = {
  id: string;
  shareCode: string;
  json: string;
  updatedAt: number;
};

type GiftItemRow = {
  id: string;
  listId: string;
  json: string;
  updatedAt: number;
};

export class SQLiteGiftCacheDataSource {
  private dbPromise: Promise<SQLiteDatabase> | null = null;

  private async getDb(): Promise<SQLiteDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = (async () => {
        const db = await openDatabaseAsync('giftregistry.db');
        await this.migrate(db);
        return db;
      })();
    }
    return this.dbPromise;
  }

  private async migrate(db: SQLiteDatabase): Promise<void> {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS gift_lists (
        id TEXT PRIMARY KEY NOT NULL,
        shareCode TEXT NOT NULL,
        json TEXT NOT NULL,
        updatedAt INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_gift_lists_shareCode ON gift_lists(shareCode);

      CREATE TABLE IF NOT EXISTS gift_items (
        id TEXT PRIMARY KEY NOT NULL,
        listId TEXT NOT NULL,
        json TEXT NOT NULL,
        updatedAt INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_gift_items_listId ON gift_items(listId);
    `);
  }

  async upsertList(list: GiftList): Promise<void> {
    const db = await this.getDb();
    const now = Date.now();
    await db.runAsync(
      `INSERT INTO gift_lists (id, shareCode, json, updatedAt)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         shareCode = excluded.shareCode,
         json = excluded.json,
         updatedAt = excluded.updatedAt`,
      list.id,
      list.shareCode,
      JSON.stringify(list),
      now,
    );
  }

  async getListByShareCode(shareCode: string): Promise<GiftList | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<GiftListRow>(
      `SELECT id, shareCode, json, updatedAt
       FROM gift_lists
       WHERE shareCode = ?
       ORDER BY updatedAt DESC
       LIMIT 1`,
      shareCode,
    );

    if (!row) return null;

    return this.parseGiftList(row.json);
  }

  async upsertItems(listId: string, items: GiftItem[]): Promise<void> {
    const db = await this.getDb();
    const now = Date.now();

    await db.withExclusiveTransactionAsync(async (tx) => {
      for (const item of items) {
        await tx.runAsync(
          `INSERT INTO gift_items (id, listId, json, updatedAt)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             listId = excluded.listId,
             json = excluded.json,
             updatedAt = excluded.updatedAt`,
          item.id,
          listId,
          JSON.stringify(item),
          now,
        );
      }
    });
  }

  async getItemsByList(listId: string): Promise<GiftItem[]> {
    const db = await this.getDb();

    const rows = await db.getAllAsync<GiftItemRow>(
      `SELECT id, listId, json, updatedAt
       FROM gift_items
       WHERE listId = ?
       ORDER BY updatedAt DESC`,
      listId,
    );

    return rows.map((r) => this.parseGiftItem(r.json));
  }

  async deleteItem(itemId: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(`DELETE FROM gift_items WHERE id = ?`, itemId);
  }

  private parseGiftList(json: string): GiftList {
    const raw = JSON.parse(json) as Omit<GiftList, 'eventDate' | 'createdAt'> & {
      eventDate: string | Date;
      createdAt: string | Date;
    };

    return {
      ...raw,
      eventDate: new Date(raw.eventDate),
      createdAt: new Date(raw.createdAt),
    };
  }

  private parseGiftItem(json: string): GiftItem {
    const raw = JSON.parse(json) as Omit<GiftItem, 'reservedAt' | 'boughtAt'> & {
      reservedAt?: string | Date;
      boughtAt?: string | Date;
    };

    return {
      ...raw,
      reservedAt: raw.reservedAt ? new Date(raw.reservedAt) : undefined,
      boughtAt: raw.boughtAt ? new Date(raw.boughtAt) : undefined,
    };
  }
}