import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ErrorAlertProps {
    message: string;
    onDismiss?: () => void;
}

export default function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
    if (!message) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.message}>{message}</Text>
            {onDismiss && (
                <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
                    <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFE5E5',
        borderLeftWidth: 4,
        borderLeftColor: '#FF6B6B',
        padding: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        fontSize: 18,
        marginRight: 12,
    },
    message: {
        flex: 1,
        color: '#FF6B6B',
        fontSize: 14,
        fontWeight: '500',
    },
    closeButton: {
        padding: 4,
    },
    closeText: {
        fontSize: 16,
        color: '#FF6B6B',
    },
});
