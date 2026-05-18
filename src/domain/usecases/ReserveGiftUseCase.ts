import { IGiftRepository } from '../../data/repositories/IGiftRepository';

export class ReserveGiftUseCase {
    constructor(private readonly giftRepository: IGiftRepository) { }

    async execute(itemId: string, reservedBy: string): Promise<{ success: boolean; message: string }> {
        if (!reservedBy.trim()) {
            return { success: false, message: 'Debes ingresar tu nombre para reservar' };
        }

        const result = await this.giftRepository.reserveItem(itemId, reservedBy.trim());
        return result;
    }
}
