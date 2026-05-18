import { IGiftRepository } from '../../data/repositories/IGiftRepository';

export class MarkAsBoughtUseCase {
    constructor(private readonly giftRepository: IGiftRepository) { }

    async execute(itemId: string): Promise<void> {
        await this.giftRepository.markAsBought(itemId);
    }
}
