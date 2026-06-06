import { create } from 'zustand';
import { GiftItem } from '../../domain/entities/GiftItem';
import { GiftList } from '../../domain/entities/GiftList';
import { ReserveGiftUseCase } from '../../domain/usecases/ReserveGiftUseCase';
import { CreateGiftListUseCase } from '../../domain/usecases/CreateGiftListUseCase';
import { MarkAsBoughtUseCase } from '../../domain/usecases/MarkAsBoughtUseCase';
import { GetGiftListByShareCodeUseCase } from '../../domain/usecases/GetGiftListByShareCodeUseCase';
import { GetItemsByListUseCase } from '../../domain/usecases/GetItemsByListUseCase';
import { GiftRepositoryImpl } from '../../data/repositories/GiftRepositoryImpl';
import { SQLiteGiftCacheDataSource } from '../../data/datasources/SQLiteGiftCacheDataSource';

interface GiftListState {
    currentList: GiftList | null;
    items: GiftItem[];
    isLoading: boolean;
    error: string | null;
    reservationMessage: string | null;
    unsubscribeListener: (() => void) | null;
    dataOrigin: 'remote' | 'cache' | null;

    createNewList: (listName: string, eventDate: string | Date, organizerId: string) => Promise<GiftList>;
    loadList: (shareCode: string) => Promise<void>;
    reserveItem: (itemId: string, reservedBy: string) => Promise<void>;
    markItemAsBought: (itemId: string) => Promise<void>;
    addItem: (data: {
        name: string;
        description?: string;
        estimatedPrice: number;
        quantityNeeded: number;
    }) => Promise<void>;
    updateItem: (itemId: string, data: Partial<Pick<GiftItem, 'description' | 'estimatedPrice' | 'quantityNeeded'>>) => Promise<void>;
    deleteItem: (itemId: string) => Promise<void>;
    subscribeToUpdates: (listId: string) => () => void;
    clearError: () => void;
    clearReservationMessage: () => void;
    clearState: () => void;

    totalItems: () => number;
    reservedItems: () => number;
    boughtItems: () => number;
    totalPrice: () => number;
}

export const useGiftListStore = create<GiftListState>((set, get) => {
    const repository = new GiftRepositoryImpl();
    const cache = new SQLiteGiftCacheDataSource();

    return {
        currentList: null,
        items: [],
        isLoading: false,
        error: null,
        reservationMessage: null,
        unsubscribeListener: null,
        dataOrigin: null,

        createNewList: async (listName: string, eventDate: string | Date, organizerId: string) => {
            set({ isLoading: true, error: null });
            try {
                const useCase = new CreateGiftListUseCase(repository);
                const date = typeof eventDate === 'string' ? new Date(eventDate) : eventDate;
                const newList = await useCase.execute(
                    listName,
                    date,
                    organizerId,
                );

                set({
                    currentList: newList,
                    isLoading: false,
                    reservationMessage: 'Lista creada exitosamente',
                });

                const isWeb = typeof window !== 'undefined';

                if (!isWeb) {
                    void cache.upsertList(newList).catch(() => { });
                }

                get().subscribeToUpdates(newList.id);

                return newList;
            } catch (error: any) {
                set({
                    error: error.message || 'Error al crear la lista',
                    isLoading: false,
                });
                throw error;
            }
        },

        loadList: async (shareCode: string) => {
            //console.log('DEBUG: loadList iniciado');
            set({ isLoading: true, error: null });

            const normalizedShareCode = shareCode.trim().toLowerCase();

            if (!normalizedShareCode) {
                set({ isLoading: false, error: 'Código de lista requerido' });
                return;
            }

            const isWeb = typeof window !== 'undefined';
            let cachedList: GiftList | null = null;

            if (!isWeb) {
                //console.log('DEBUG: Buscando en cache:', normalizedShareCode);
                cachedList = await cache
                    .getListByShareCode(normalizedShareCode)
                    .catch((e: unknown) => {
                        //console.log('DEBUG: Error en cache:', e);
                        return null;
                    });
                //console.log('DEBUG: cachedList resultado:', cachedList);
            } else {
                //console.log('DEBUG: En web, saltando cache de SQLite');
            }

            if (cachedList) {
                //console.log('DEBUG: Encontrado en cache, cargando items');
                const cachedItems = await cache
                    .getItemsByList(cachedList.id)
                    .catch(() => []);

                set({
                    currentList: cachedList,
                    items: cachedItems,
                    isLoading: false,
                    dataOrigin: 'cache',
                });
            }

            try {
                //console.log('DEBUG: Intentando cargar desde Firebase');
                const getListUseCase = new GetGiftListByShareCodeUseCase(repository);
                //console.log('DEBUG: Ejecutando getListUseCase');
                const list = await getListUseCase.execute(normalizedShareCode);
                //console.log('DEBUG: Lista obtenida de Firebase:', list);

                if (!list) {
                    throw new Error('Lista no encontrada con ese código');
                }

                set({ currentList: list });

                //console.log('DEBUG: Obteniendo items de la lista');
                const getItemsUseCase = new GetItemsByListUseCase(repository);
                const items = await getItemsUseCase.execute(list.id);
                //console.log('DEBUG: Items obtenidos:', items);

                set({
                    currentList: list,
                    items,
                    isLoading: false,
                    dataOrigin: 'remote',
                });

                //console.log('DEBUG: Suscribiendo a actualizaciones');
                get().subscribeToUpdates(list.id);

                if (!isWeb) {
                    console.log('DEBUG: Guardando en cache');
                    void cache.upsertList(list).catch(() => { });
                    void cache.upsertItems(list.id, items).catch(() => { });
                }

                //console.log('DEBUG: loadList completado exitosamente');
            } catch (error: any) {
                console.error('DEBUG: Error en loadList:', error);
                if (cachedList) {
                    set({
                        isLoading: false,
                        reservationMessage: 'Modo offline: mostrando datos guardados',
                    });
                    return;
                }

                set({
                    error: error.message || 'Error al cargar la lista',
                    isLoading: false,
                    dataOrigin: null,
                });
            }
        },

        reserveItem: async (itemId: string, reservedBy: string) => {
            set({ isLoading: true, error: null });
            try {
                const useCase = new ReserveGiftUseCase(repository);
                const result = await useCase.execute(itemId, reservedBy);

                if (!result.success) {
                    throw new Error(result.message);
                }

                set({
                    isLoading: false,
                    reservationMessage: result.message,
                });

            } catch (error: any) {
                set({
                    error: error.message || 'No se pudo reservar el regalo',
                    isLoading: false,
                });
            }
        },

        markItemAsBought: async (itemId: string) => {
            set({ isLoading: true, error: null });
            try {
                const useCase = new MarkAsBoughtUseCase(repository);
                await useCase.execute(itemId);

                set({
                    isLoading: false,
                    reservationMessage: 'Artículo marcado como comprado',
                });

            } catch (error: any) {
                set({
                    error: error.message || 'No se pudo marcar como comprado',
                    isLoading: false,
                });
            }
        },

        addItem: async (data) => {
            const listId = get().currentList?.id;
            if (!listId) {
                set({ error: 'Primero debes cargar una lista', isLoading: false });
                return;
            }

            set({ isLoading: true, error: null });
            try {
                const created = await repository.addItem({
                    name: data.name.trim(),
                    description: data.description?.trim() ?? '',
                    estimatedPrice: data.estimatedPrice,
                    quantityNeeded: data.quantityNeeded,
                    status: 'available',
                    listId,
                });

                set((state) => ({
                    items: [created, ...state.items],
                    isLoading: false,
                    reservationMessage: 'Artículo agregado',
                }));

                void cache.upsertItems(listId, get().items).catch(() => { });
            } catch (error: any) {
                set({
                    error: error.message || 'Error al agregar el artículo',
                    isLoading: false,
                });
            }
        },

        updateItem: async (itemId, data) => {
            set({ isLoading: true, error: null });
            const prev = get().items;
            const listId = get().currentList?.id;

            set((state) => ({
                items: state.items.map((i) => (i.id === itemId ? { ...i, ...data } : i)),
            }));

            try {
                await repository.updateItem(itemId, data);
                set({ isLoading: false, reservationMessage: 'Artículo actualizado' });
                if (listId) void cache.upsertItems(listId, get().items).catch(() => { });
            } catch (error: any) {
                set({
                    items: prev,
                    isLoading: false,
                    error: error.message || 'Error al actualizar el artículo',
                });
            }
        },

        deleteItem: async (itemId) => {
            set({ isLoading: true, error: null });
            const prev = get().items;
            const listId = get().currentList?.id;

            set((state) => ({
                items: state.items.filter((i) => i.id !== itemId),
            }));

            try {
                await repository.deleteItem(itemId);
                set({ isLoading: false, reservationMessage: 'Artículo eliminado' });
                if (listId) void cache.deleteItem(itemId).catch(() => { });
            } catch (error: any) {
                set({
                    items: prev,
                    isLoading: false,
                    error: error.message || 'Error al eliminar el artículo',
                });
            }
        },

        subscribeToUpdates: (listId: string) => {
            const { unsubscribeListener } = get();

            if (unsubscribeListener) {
                unsubscribeListener();
            }

            try {
                const unsubscribe = repository.subscribeToList(
                    listId,
                    (updatedItems: GiftItem[]) => {
                        set({
                            items: updatedItems,
                        });
                        void cache.upsertItems(listId, updatedItems).catch(() => { });
                    },
                );

                set({ unsubscribeListener: unsubscribe });

                return unsubscribe;
            } catch (error: any) {
                set({
                    error: error.message || 'Error al suscribirse a actualizaciones',
                });
                return () => { };
            }
        },

        clearError: () => {
            set({ error: null });
        },

        clearReservationMessage: () => {
            set({ reservationMessage: null });
        },

        clearState: () => {
            const { unsubscribeListener } = get();
            if (unsubscribeListener) {
                unsubscribeListener();
            }

            set({
                currentList: null,
                items: [],
                isLoading: false,
                error: null,
                reservationMessage: null,
                unsubscribeListener: null,
                dataOrigin: null,
            });
        },

        totalItems: () => {
            return get().items.length;
        },

        reservedItems: () => {
            return get().items.filter((item) => item.status === 'reserved').length;
        },

        boughtItems: () => {
            return get().items.filter((item) => item.status === 'bought').length;
        },

        totalPrice: () => {
            return get().items.reduce(
                (sum, item) => sum + item.estimatedPrice * item.quantityNeeded,
                0,
            );
        },
    };
});

export const useGiftListViewModel = useGiftListStore;
