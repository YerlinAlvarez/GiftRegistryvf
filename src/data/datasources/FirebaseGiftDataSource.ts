import {
    collection, doc, getDocs,
    addDoc, updateDoc, deleteDoc,
    query, where, onSnapshot,
    runTransaction, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { GiftItem, GiftStatus } from '../../domain/entities/GiftItem';
import { GiftList } from '../../domain/entities/GiftList';

export class FirebaseGiftDataSource {
    private normalizeNameKey(name: string): string {
        const key = name
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 60);

        if (!key) throw new Error('Nombre de artículo inválido');
        return key;
    }

    async createList(data: Omit<GiftList, 'id' | 'createdAt'>): Promise<GiftList> {
        const ref = await addDoc(collection(db, 'giftLists'), {
            ...data,
            eventDate: Timestamp.fromDate(data.eventDate),
            createdAt: serverTimestamp(),
        });

        return {
            ...data,
            id: ref.id,
            createdAt: new Date(),
        };
    }

    async getListByShareCode(shareCode: string): Promise<GiftList | null> {
        const q = query(
            collection(db, 'giftLists'),
            where('shareCode', '==', shareCode)
        );

        const snap = await getDocs(q);

        if (snap.empty) return null;

        const d = snap.docs[0];
        return this.mapList(d.id, d.data());
    }

    async getListsByOwner(ownerId: string): Promise<GiftList[]> {
        const q = query(
            collection(db, 'giftLists'),
            where('ownerId', '==', ownerId)
        );

        const snap = await getDocs(q);

        return snap.docs.map(d => this.mapList(d.id, d.data()));
    }

    async getItemsByList(listId: string): Promise<GiftItem[]> {
        const q = query(
            collection(db, 'giftItems'),
            where('listId', '==', listId)
        );

        const snap = await getDocs(q);

        return snap.docs.map(d => this.mapItem(d.id, d.data()));
    }

    async addItem(item: Omit<GiftItem, 'id'>): Promise<GiftItem> {
        const nameKey = this.normalizeNameKey(item.name);
        const docId = `${item.listId}_${nameKey}`;

        await runTransaction(db, async (transaction) => {
            const ref = doc(db, 'giftItems', docId);
            const snap = await transaction.get(ref);

            if (snap.exists()) {
                throw new Error('Este artículo ya existe en la lista');
            }

            transaction.set(ref, {
                ...item,
                nameKey,
                createdAt: serverTimestamp(),
            } as any);
        });

        return {
            ...item,
            id: docId,
        };
    }

    async updateItem(itemId: string, data: Partial<GiftItem>): Promise<void> {
        await updateDoc(doc(db, 'giftItems', itemId), data);
    }

    async deleteItem(itemId: string): Promise<void> {
        await deleteDoc(doc(db, 'giftItems', itemId));
    }

    async reserveItem(
        itemId: string,
        reservedBy: string
    ): Promise<{ success: boolean; message: string }> {

        try {
            await runTransaction(db, async (transaction) => {

                const itemRef = doc(db, 'giftItems', itemId);
                const itemSnap = await transaction.get(itemRef);

                if (!itemSnap.exists()) {
                    throw new Error('El artículo no existe');
                }

                const current = itemSnap.data() as any;

                if (current.status !== 'available') {
                    throw new Error('Este regalo ya fue tomado por alguien más');
                }

                transaction.update(itemRef, {
                    status: 'reserved' as GiftStatus,
                    reservedBy,
                    reservedAt: serverTimestamp(),
                });
            });

            return {
                success: true,
                message: 'Regalo reservado exitosamente'
            };

        } catch (error: any) {
            return {
                success: false,
                message: error.message ?? 'Ups, alguien más se adelantó con este regalo',
            };
        }
    }

    async markAsBought(itemId: string): Promise<void> {
        await updateDoc(doc(db, 'giftItems', itemId), {
            status: 'bought' as GiftStatus,
            boughtAt: serverTimestamp(),
        });
    }

    subscribeToList(
        listId: string,
        callback: (items: GiftItem[]) => void
    ): () => void {

        const q = query(
            collection(db, 'giftItems'),
            where('listId', '==', listId)
        );

        return onSnapshot(
            q,
            (snap) => {
                const items = snap.docs.map(d =>
                    this.mapItem(d.id, d.data())
                );
                callback(items);
            },
            (error) => {
                console.error('Error en suscripción:', error);
            }
        );
    }

    private mapItem(id: string, data: any): GiftItem {
        return {
            ...data,
            id,
            reservedAt: data.reservedAt?.toDate?.(),
            boughtAt: data.boughtAt?.toDate?.(),
        };
    }

    private mapList(id: string, data: any): GiftList {
        return {
            ...data,
            id,
            eventDate: data.eventDate?.toDate?.(),
            createdAt: data.createdAt?.toDate?.(),
        };
    }
}
