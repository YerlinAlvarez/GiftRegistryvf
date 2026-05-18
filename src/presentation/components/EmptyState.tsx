import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EmptyStateProps {
    title?: string;
    message?: string;
    icon?: string;
}

export default function EmptyState({
    title = 'Sin regalos',
    message = 'Aún no hay artículos en esta lista',
    icon = '🎁',
}: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    icon: {
        fontSize: 64,
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
});
