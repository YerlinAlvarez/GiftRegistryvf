import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, StyleSheet,
    ActivityIndicator, Alert, TextInput,
    TouchableOpacity, Modal, KeyboardAvoidingView, Platform
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGiftListStore } from '../../src/presentation/viewmodels/useGiftListViewModel';
import { GiftCard } from '../../src/presentation/components/GiftCard';
import { ProgressBar } from '../../src/presentation/components/ProgressBar';
import { GiftItem } from '../../src/domain/entities/GiftItem';
import { useAuthStore } from '../../src/presentation/viewmodels/useAuthViewModel';

export default function GiftListScreen() {
    const { shareCode } = useLocalSearchParams<{ shareCode: string }>();
    const {
        currentList, items, isLoading, error,
        reservationMessage, loadList, reserveItem,
        markItemAsBought, subscribeToUpdates, updateItem, deleteItem,
        clearError, clearReservationMessage
    } = useGiftListStore();
    const dataOrigin = useGiftListStore((s) => s.dataOrigin);
    const user = useAuthStore((s) => s.user);
    const addItem = useGiftListStore((s) => s.addItem);

    const [selectedItem, setSelectedItem] = useState<GiftItem | null>(null);
    const [guestName, setGuestName] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [newQty, setNewQty] = useState('1');
    const [editingItem, setEditingItem] = useState<GiftItem | null>(null);

    const isOwner = Boolean(user && currentList && user.id === currentList.ownerId);

    useEffect(() => {
        if (shareCode) {
            loadList(shareCode);
        }
    }, [shareCode]);

    useEffect(() => {
        if (!currentList?.id) return;

        const unsubscribe = subscribeToUpdates(currentList.id);

        return () => {
            unsubscribe();
        };
    }, [currentList?.id]);

    useEffect(() => {
        if (reservationMessage) {
            Alert.alert('Listo', reservationMessage, [
                { text: 'OK', onPress: clearReservationMessage }
            ]);
        }
    }, [reservationMessage]);

    useEffect(() => {
        if (error) {
            Alert.alert('Aviso', error, [{ text: 'OK', onPress: clearError }]);
        }
    }, [error]);

    const handleReservePress = (itemId: string) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return;
        setSelectedItem(item);
        setGuestName('');
        setModalVisible(true);
    };

    const handleConfirmReservation = async () => {
        if (!guestName.trim()) {
            Alert.alert('Campo requerido', 'Ingresa tu nombre para reservar');
            return;
        }

        if (!selectedItem) return;

        await reserveItem(selectedItem.id, guestName.trim());

        setModalVisible(false);
    };

    if (isLoading && !currentList) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#534AB7" />
                <Text style={styles.loadingText}>Cargando lista...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {currentList && (
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <View style={styles.headerTextBlock}>
                            <Text style={styles.headerTitle}>Lista de {currentList.motherName}</Text>
                            <Text style={styles.headerCode}>Código: {currentList.shareCode}</Text>
                            {dataOrigin === 'cache' ? (
                                <Text style={styles.headerBadge}>OFFLINE</Text>
                            ) : null}
                        </View>
                        {isOwner ? (
                            <TouchableOpacity
                                style={styles.btnHeader}
                                onPress={() => {
                                    setEditingItem(null);
                                    setNewName('');
                                    setNewDescription('');
                                    setNewPrice('');
                                    setNewQty('1');
                                    setAddModalVisible(true);
                                }}
                            >
                                <Text style={styles.btnHeaderText}>+ Agregar</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </View>
            )}

            <FlatList
                data={items}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListHeaderComponent={
                    items.length > 0 ? <ProgressBar items={items} /> : null
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>
                                Aún no hay artículos en esta lista
                            </Text>
                        </View>
                    ) : null
                }
                renderItem={({ item }) => (
                    <GiftCard
                        item={item}
                        onReserve={handleReservePress}
                        onMarkBought={markItemAsBought}
                        onEdit={(it: GiftItem) => {
                            setEditingItem(it);
                            setNewName(it.name);
                            setNewDescription(it.description ?? '');
                            setNewPrice(String(it.estimatedPrice ?? 0));
                            setNewQty(String(it.quantityNeeded ?? 1));
                            setAddModalVisible(true);
                        }}
                        onDelete={(itemId: string) => {
                            Alert.alert(
                                'Eliminar artículo',
                                '¿Seguro que quieres eliminar este artículo?',
                                [
                                    { text: 'Cancelar', style: 'cancel' },
                                    {
                                        text: 'Eliminar',
                                        style: 'destructive',
                                        onPress: async () => {
                                            await deleteItem(itemId);
                                        },
                                    },
                                ],
                            );
                        }}
                        isOwner={isOwner}
                    />
                )}
            />

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>¿Quién regala esto?</Text>
                        {selectedItem && (
                            <Text style={styles.modalItem}>{selectedItem.name}</Text>
                        )}
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Tu nombre"
                            placeholderTextColor="#B4B2A9"
                            value={guestName}
                            onChangeText={setGuestName}
                            autoFocus
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.btnCancel}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.btnCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.btnConfirm}
                                onPress={handleConfirmReservation}
                            >
                                <Text style={styles.btnConfirmText}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <Modal
                visible={addModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setAddModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>
                            {editingItem ? 'Editar artículo' : 'Agregar artículo'}
                        </Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Nombre (ej: Pañales etapa 1)"
                            placeholderTextColor="#B4B2A9"
                            value={newName}
                            onChangeText={setNewName}
                            autoFocus
                            editable={!editingItem}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Descripción (opcional)"
                            placeholderTextColor="#B4B2A9"
                            value={newDescription}
                            onChangeText={setNewDescription}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Precio estimado (ej: 45000)"
                            placeholderTextColor="#B4B2A9"
                            value={newPrice}
                            onChangeText={setNewPrice}
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Cantidad (ej: 1)"
                            placeholderTextColor="#B4B2A9"
                            value={newQty}
                            onChangeText={setNewQty}
                            keyboardType="numeric"
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.btnCancel}
                                onPress={() => setAddModalVisible(false)}
                            >
                                <Text style={styles.btnCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.btnConfirm}
                                onPress={async () => {
                                    if (!newName.trim()) {
                                        Alert.alert('Campo requerido', 'Ingresa el nombre del artículo');
                                        return;
                                    }
                                    const estimatedPrice = Number(newPrice);
                                    const quantityNeeded = Number(newQty);
                                    if (!Number.isFinite(estimatedPrice) || estimatedPrice < 0) {
                                        Alert.alert('Precio', 'Ingresa un precio válido');
                                        return;
                                    }
                                    if (!Number.isFinite(quantityNeeded) || quantityNeeded <= 0) {
                                        Alert.alert('Cantidad', 'Ingresa una cantidad válida');
                                        return;
                                    }

                                    if (editingItem) {
                                        await updateItem(editingItem.id, {
                                            description: newDescription,
                                            estimatedPrice,
                                            quantityNeeded,
                                        });
                                    } else {
                                        await addItem({
                                            name: newName,
                                            description: newDescription,
                                            estimatedPrice,
                                            quantityNeeded,
                                        });
                                    }
                                    setAddModalVisible(false);
                                }}
                            >
                                <Text style={styles.btnConfirmText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1EFE8',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        color: '#5F5E5A',
        fontSize: 15,
    },
    header: {
        backgroundColor: '#534AB7',
        padding: 20,
        paddingTop: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTextBlock: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    headerCode: {
        fontSize: 13,
        color: '#AFA9EC',
        marginTop: 4,
    },
    headerBadge: {
        alignSelf: 'flex-start',
        marginTop: 10,
        backgroundColor: 'rgba(0,0,0,0.18)',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        color: '#fff',
        fontWeight: '700',
        fontSize: 12,
        letterSpacing: 0.4,
    },
    btnHeader: {
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    btnHeaderText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 13,
    },
    list: {
        padding: 16,
    },
    empty: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyText: {
        color: '#888780',
        fontSize: 15,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    modalCard: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        paddingBottom: 40,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2C2C2A',
        marginBottom: 6,
    },
    modalItem: {
        fontSize: 14,
        color: '#5F5E5A',
        marginBottom: 16,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#D3D1C7',
        borderRadius: 10,
        padding: 14,
        fontSize: 15,
        color: '#2C2C2A',
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: 'row',
    },
    btnCancel: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#D3D1C7',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
        marginRight: 6,
    },
    btnCancelText: {
        color: '#5F5E5A',
        fontWeight: '500',
    },
    btnConfirm: {
        flex: 1,
        backgroundColor: '#534AB7',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
        marginLeft: 6,
    },
    btnConfirmText: {
        color: '#fff',
        fontWeight: '600',
    },
});
