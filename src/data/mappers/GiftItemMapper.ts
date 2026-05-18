import { GiftItem, GiftStatus } from '../../domain/entities/GiftItem';

export class GiftItemMapper {
    /**
     * Convierte un documento de Firestore a una entidad GiftItem
     * @param id - ID del documento
     * @param data - Datos raw de Firestore
     * @returns GiftItem tipada correctamente
     */
    static toDomain(id: string, data: any): GiftItem {
        // Validar que los campos requeridos existan
        if (data?.name == null || data?.estimatedPrice == null || data?.quantityNeeded == null) {
            throw new Error(`Documento inválido: ${id}. Faltan campos requeridos.`);
        }

        const reservedAt = data.reservedAt ? this.convertFirestoreTimestamp(data.reservedAt) : undefined;
        const boughtAt = data.boughtAt ? this.convertFirestoreTimestamp(data.boughtAt) : undefined;

        const validStatuses: GiftStatus[] = ['available', 'reserved', 'bought'];
        const status = validStatuses.includes(data.status) ? data.status : 'available';

        return {
            id,
            name: data.name,
            description: data.description || '',
            imageUrl: data.imageUrl,
            estimatedPrice: Number(data.estimatedPrice),
            quantityNeeded: Number(data.quantityNeeded),
            status,
            reservedBy: data.reservedBy,
            reservedAt,
            boughtAt,
            listId: data.listId,
        };
    }

    /**
     * Convierte una entidad GiftItem a formato Firestore
     * @param item - Entidad de dominio
     * @returns Objeto preparado para guardar en Firestore
     */
    static toPersistence(item: GiftItem): Record<string, any> {
        return {
            name: item.name,
            description: item.description || '',
            imageUrl: item.imageUrl,
            estimatedPrice: item.estimatedPrice,
            quantityNeeded: item.quantityNeeded,
            status: item.status,
            reservedBy: item.reservedBy || null,
            reservedAt: item.reservedAt || null,
            boughtAt: item.boughtAt || null,
            listId: item.listId,
        };
    }

    private static convertFirestoreTimestamp(timestamp: any): Date {
        if (!timestamp) return undefined!;

        if (typeof timestamp === 'object' && 'seconds' in timestamp) {
            return new Date(timestamp.seconds * 1000);
        }

        if (timestamp instanceof Date) {
            return timestamp;
        }

        if (typeof timestamp === 'number') {
            return new Date(timestamp);
        }

        return new Date();
    }

    static toDomainList(
        docs: Array<{ id: string; data: () => any }>,
    ): GiftItem[] {
        return docs.map((doc) => this.toDomain(doc.id, doc.data()));
    }
}
