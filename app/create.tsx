import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { useGiftListStore } from '../src/presentation/viewmodels/useGiftListViewModel';
import { useAuthStore } from '../src/presentation/viewmodels/useAuthViewModel';
import { AlertModal } from '../src/presentation/components/AlertModal';

interface AlertState {
    visible: boolean;
    title: string;
    message: string;
    buttons: Array<{
        text: string;
        onPress: () => void;
        style?: 'default' | 'cancel' | 'destructive';
    }>;
}

export default function CreateScreen() {
    const [motherName, setMotherName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [alert, setAlert] = useState<AlertState | null>(null);
    const { createNewList, isLoading, error, clearError } = useGiftListStore();
    const user = useAuthStore((s) => s.user);

    const showAlert = (title: string, message: string, buttons: AlertState['buttons']) => {
        setAlert({ visible: true, title, message, buttons });
    };

    const closeAlert = () => {
        setAlert(null);
    };

    const handleDateChange = (text: string) => {
        const cleaned = text.replace(/[^0-9\/]/g, '');

        let formatted = cleaned;

        if (cleaned.length === 2 && !cleaned.includes('/')) {
            formatted = cleaned + '/';
        }
        else if (cleaned.length === 5 && (cleaned.match(/\//g) || []).length === 1) {
            formatted = cleaned + '/';
        }

        setEventDate(formatted);
    };

    const handleCreate = async () => {
        if (!user) {
            showAlert(
                'Iniciar sesión',
                'Necesitas iniciar sesión para crear una lista',
                [{ text: 'Ir a login', onPress: () => { closeAlert(); router.push('./login'); } }],
            );
            return;
        }

        if (!motherName.trim()) {
            showAlert('Campo requerido', 'Ingresa el nombre de la mamá', [{ text: 'OK', onPress: closeAlert }]);
            return;
        }

        const parts = eventDate.split('/');
        if (parts.length !== 3) {
            showAlert('Fecha inválida', 'Usa el formato DD/MM/AAAA', [{ text: 'OK', onPress: closeAlert }]);
            return;
        }

        const date = new Date(
            parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])
        );

        if (isNaN(date.getTime()) || date < new Date()) {
            showAlert('Fecha inválida', 'La fecha debe ser futura', [{ text: 'OK', onPress: closeAlert }]);
            return;
        }

        try {
            console.log('DEBUG: Iniciando createNewList con:', { motherName, date, userId: user.id });
            const list = await createNewList(motherName, date, user.id);
            console.log('DEBUG: Lista creada exitosamente:', list);

            showAlert(
                'Lista creada',
                `Código para compartir:\n\n${list.shareCode}`,
                [
                    {
                        text: 'Copiar código',
                        onPress: () => {
                            if (navigator?.clipboard) {
                                navigator.clipboard.writeText(list.shareCode);
                            }
                            closeAlert();
                        },
                    },
                    {
                        text: 'Ver lista',
                        onPress: () => {
                            closeAlert();
                            router.replace(`/list/${list.shareCode}`);
                        },
                    },
                ]
            );
        } catch (e: any) {
            console.error('DEBUG: Error al crear lista:', e);
            showAlert('Error', e.message || 'No se pudo crear la lista', [{ text: 'OK', onPress: closeAlert }]);
        }
    };

    return (
        <>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.label}>Nombre de la futura mamá</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ej: María García"
                        placeholderTextColor="#B4B2A9"
                        value={motherName}
                        onChangeText={(t) => { setMotherName(t); clearError(); }}
                    />

                    <Text style={styles.label}>Fecha del evento</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="DD/MM/AAAA"
                        placeholderTextColor="#B4B2A9"
                        value={eventDate}
                        onChangeText={handleDateChange}
                        keyboardType="decimal-pad"
                        maxLength={10}
                    />

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <TouchableOpacity
                        style={[styles.btn, isLoading && styles.btnDisabled]}
                        onPress={handleCreate}
                        disabled={isLoading}
                    >
                        {isLoading
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.btnText}>Crear lista</Text>
                        }
                    </TouchableOpacity>
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>¿Cómo funciona?</Text>
                    <Text style={styles.infoText}>
                        1. Creas la lista con el nombre de la mamá{'\n'}
                        2. Agregas los artículos que se necesitan{'\n'}
                        3. Compartes el código con los invitados{'\n'}
                        4. Ellos reservan los regalos en tiempo real
                    </Text>
                </View>
            </ScrollView>

            {alert && (
                <AlertModal
                    visible={alert.visible}
                    title={alert.title}
                    message={alert.message}
                    buttons={alert.buttons}
                />
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#F1EFE8',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#444441',
        marginBottom: 8,
        marginTop: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D3D1C7',
        borderRadius: 10,
        padding: 14,
        fontSize: 15,
        color: '#2C2C2A',
        backgroundColor: '#FAFAF8',
        marginBottom: 16,
    },
    errorText: {
        color: '#A32D2D',
        fontSize: 13,
        marginBottom: 10,
    },
    btn: {
        backgroundColor: '#534AB7',
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
        marginTop: 4,
    },
    btnDisabled: { opacity: 0.6 },
    btnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    infoCard: {
        backgroundColor: '#EEEDFE',
        borderRadius: 16,
        padding: 20,
    },
    infoTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#3C3489',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 14,
        color: '#534AB7',
        lineHeight: 24,
    },
});
