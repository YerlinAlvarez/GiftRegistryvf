import { IGiftRepository } from '../../data/repositories/IGiftRepository';
import { GiftList } from '../entities/GiftList';

export class GetGiftListByShareCodeUseCase {
    constructor(private repository: IGiftRepository) { }

    async execute(shareCode: string): Promise<GiftList | null> {
        return this.repository.getListByShareCode(shareCode);
    }
}
