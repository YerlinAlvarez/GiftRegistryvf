import { IGiftRepository } from '../../data/repositories/IGiftRepository';
import { GiftItem } from '../entities/GiftItem';

export class GetItemsByListUseCase {
    constructor(private repository: IGiftRepository) { }

    async execute(listId: string): Promise<GiftItem[]> {
        return this.repository.getItemsByList(listId);
    }
}
