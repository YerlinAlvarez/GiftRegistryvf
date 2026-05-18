import { GiftList } from '../entities/GiftList';
import { IGiftRepository } from '../../data/repositories/IGiftRepository';

export class CreateGiftListUseCase {
    constructor(private readonly giftRepository: IGiftRepository) { }

    async execute(
        motherName: string,
        eventDate: Date,
        ownerId: string
    ): Promise<GiftList> {
        if (!motherName.trim()) throw new Error('El nombre de la mamá es requerido');
        if (eventDate < new Date()) throw new Error('La fecha del evento debe ser futura');

        const shareCode = this.generateShareCode(motherName);

        return this.giftRepository.createList({
            motherName: motherName.trim(),
            eventDate,
            shareCode,
            ownerId,
            totalItems: 0,
            boughtItems: 0,
        });
    }

    private generateShareCode(name: string): string {
        const base = name.toLowerCase().replace(/\s+/g, '').slice(0, 6);
        const random = Math.random().toString(36).slice(2, 6);
        return `${base}-${random}`;
    }
}
