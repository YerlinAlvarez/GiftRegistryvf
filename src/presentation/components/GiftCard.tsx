import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GiftItem, GiftStatus } from '../../domain/entities/GiftItem';

interface Props {
    item: GiftItem;
    onReserve: (itemId: string) => void;
    onMarkBought: (itemId: string) => void;
    onEdit?: (item: GiftItem) => void;
    onDelete?: (itemId: string) => void;
    isOwner: boolean;
}

const statusConfig: Record<GiftStatus, { label: string; color: string; bg: string }> = {
    available: { label: 'Disponible', color: '#0F6E56', bg: '#E1F5EE' },
    reserved: { label: 'Reservado', color: '#854F0B', bg: '#FAEEDA' },
    bought: { label: 'Comprado', color: '#3C3489', bg: '#EEEDFE' },
};

export const GiftCard: React.FC<Props> = ({
    item,
    onReserve,
    onMarkBought,
    onEdit,
    onDelete,
    isOwner,
}) => {
    const config = statusConfig[item.status];
    const formattedPrice =
        item.estimatedPrice > 0
            ? String(Math.round(item.estimatedPrice)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
            : null;

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={[styles.badge, { backgroundColor: config.bg }]}>
                    <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
                </View>
            </View>

            {item.description ? (
                <Text style={styles.description}>{item.description}</Text>
            ) : null}

            <View style={styles.footer}>
                <Text style={styles.price}>
                    {formattedPrice ? `~$${formattedPrice}` : 'Precio no definido'}
                </Text>

                {item.status === 'available' && !isOwner && (
                    <TouchableOpacity style={styles.btnReserve} onPress={() => onReserve(item.id)}>
                        <Text style={styles.btnText}>Yo lo regalo</Text>
                    </TouchableOpacity>
                )}

                {item.status === 'available' && isOwner && (
                    <View style={styles.ownerActions}>
                        <TouchableOpacity style={styles.btnEdit} onPress={() => onEdit?.(item)}>
                            <Text style={styles.btnText}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnDelete} onPress={() => onDelete?.(item.id)}>
                            <Text style={styles.btnText}>Eliminar</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {item.status === 'reserved' && item.reservedBy && (
                    <Text style={styles.reservedBy}>Reservado por {item.reservedBy}</Text>
                )}

                {item.status === 'reserved' && isOwner && (
                    <TouchableOpacity style={styles.btnBought} onPress={() => onMarkBought(item.id)}>
                        <Text style={styles.btnText}>Marcar comprado</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default GiftCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
        color: '#2C2C2A',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '500',
    },
    description: {
        fontSize: 14,
        color: '#5F5E5A',
        marginBottom: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    price: {
        fontSize: 14,
        color: '#888780',
        flex: 1,
        marginRight: 10,
    },
    reservedBy: {
        fontSize: 13,
        color: '#854F0B',
        fontStyle: 'italic',
    },
    btnReserve: {
        backgroundColor: '#1D9E75',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    btnBought: {
        backgroundColor: '#534AB7',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    ownerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    btnEdit: {
        backgroundColor: '#534AB7',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginRight: 8,
    },
    btnDelete: {
        backgroundColor: '#A32D2D',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    btnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
});
