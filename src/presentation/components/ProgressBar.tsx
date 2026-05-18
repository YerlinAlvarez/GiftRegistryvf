import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GiftItem } from '../../domain/entities/GiftItem';

interface Props {
    items: GiftItem[];
}

export const ProgressBar: React.FC<Props> = ({ items }) => {
    const total = items.length;
    const bought = items.filter(i => i.status === 'bought').length;
    const reserved = items.filter(i => i.status === 'reserved').length;
    const available = total - bought - reserved;
    const pct = total > 0 ? Math.round((bought / total) * 100) : 0;

    if (total === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Progreso de regalos</Text>
                <Text style={styles.pct}>{pct}% completado</Text>
            </View>

            <View style={styles.bar}>
                {bought > 0 && (
                    <View style={[styles.segment, styles.bought, { flex: bought }]} />
                )}
                {reserved > 0 && (
                    <View style={[styles.segment, styles.reserved, { flex: reserved }]} />
                )}
                {available > 0 && (
                    <View style={[styles.segment, styles.available, { flex: available }]} />
                )}
            </View>

            <View style={styles.legend}>
                <View style={styles.legendBlock}>
                    <Text style={[styles.dot, styles.dotBought]}>●</Text>
                    <Text style={styles.legendText}>Comprados: {bought}</Text>
                </View>
                <View style={styles.legendBlock}>
                    <Text style={[styles.dot, styles.dotReserved]}>●</Text>
                    <Text style={styles.legendText}>Reservados: {reserved}</Text>
                </View>
                <View style={styles.legendBlock}>
                    <Text style={[styles.dot, styles.dotAvailable]}>●</Text>
                    <Text style={styles.legendText}>Disponibles: {available}</Text>
                </View>
            </View>
        </View>
    );
};

export default ProgressBar;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    title: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2C2C2A',
    },
    pct: {
        fontSize: 14,
        fontWeight: '600',
        color: '#534AB7',
    },
    bar: {
        flexDirection: 'row',
        height: 10,
        borderRadius: 6,
        overflow: 'hidden',
        backgroundColor: '#F1EFE8',
    },
    segment: {
        height: '100%',
    },
    bought: {
        backgroundColor: '#534AB7',
    },
    reserved: {
        backgroundColor: '#EF9F27',
    },
    available: {
        backgroundColor: '#E1F5EE',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    legendBlock: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendText: {
        fontSize: 12,
        color: '#5F5E5A',
    },
    dot: {
        fontSize: 12,
        marginRight: 4,
    },
    dotBought: {
        color: '#534AB7',
    },
    dotReserved: {
        color: '#EF9F27',
    },
    dotAvailable: {
        color: '#1D9E75',
    },
});
