import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { useGiftListStore } from '../src/presentation/viewmodels/useGiftListViewModel';
import { useAuthStore } from '../src/presentation/viewmodels/useAuthViewModel';

export default function HomeScreen() {
    const [shareCode, setShareCode] = useState('');
    const { loadList, isLoading, error, clearError } = useGiftListStore();
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    const handleJoinList = async () => {
        const code = shareCode.trim();
        if (!code) {
            Alert.alert('Código requerido', 'Ingresa el código de la lista');
            return;
        }

        console.log('DEBUG: Iniciando loadList con shareCode:', code);
        await loadList(code);
        const { currentList, error: latestError } = useGiftListStore.getState();
        console.log('DEBUG: loadList completado. currentList:', currentList, 'error:', latestError);

        if (!latestError && currentList) {
            console.log('DEBUG: Navegando a /list/' + code);
            router.push(`/list/${code}`);
        } else {
            console.error('DEBUG: No se cargó la lista. Error:', latestError);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.hero}>
                <Text style={styles.emoji}>🎁</Text>
                <Text style={styles.title}>GiftRegistry</Text>
                <Text style={styles.subtitle}>Lista de regalos para Baby Shower</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Unirme a una lista</Text>
                <Text style={styles.cardSubtitle}>
                    Ingresa el código que te compartió la organizadora
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: maria-x4k2"
                    placeholderTextColor="#B4B2A9"
                    value={shareCode}
                    onChangeText={(t) => { setShareCode(t); clearError(); }}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {error && <Text style={styles.errorText}>{error}</Text>}
                <TouchableOpacity
                    style={[styles.btnPrimary, isLoading && styles.btnDisabled]}
                    onPress={handleJoinList}
                    disabled={isLoading}
                >
                    {isLoading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.btnText}>Ver lista de regalos</Text>
                    }
                </TouchableOpacity>
            </View>

            <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o</Text>
                <View style={styles.dividerLine} />
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Crear mi lista</Text>
                <Text style={styles.cardSubtitle}>
                    ¿Eres la organizadora? Crea la lista y comparte el código
                </Text>
                <TouchableOpacity
                    style={styles.btnSecondary}
                    onPress={() => router.push('/create')}
                >
                    <Text style={styles.btnSecondaryText}>Crear lista nueva</Text>
                </TouchableOpacity>

                <View style={styles.authRow}>
                    {user ? (
                        <>
                            <Text style={styles.authText}>Sesión: {user.email}</Text>
                            <TouchableOpacity onPress={logout}>
                                <Text style={styles.authLink}>Salir</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity onPress={() => router.push('./login')}>
                            <Text style={styles.authLink}>Iniciar sesión</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#F1EFE8',
    },
    hero: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emoji: {
        fontSize: 56,
        marginBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#2C2C2A',
    },
    subtitle: {
        fontSize: 15,
        color: '#5F5E5A',
        marginTop: 4,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#2C2C2A',
        marginBottom: 6,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#888780',
        marginBottom: 16,
        lineHeight: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D3D1C7',
        borderRadius: 10,
        padding: 14,
        fontSize: 15,
        color: '#2C2C2A',
        backgroundColor: '#FAFAF8',
        marginBottom: 12,
    },
    errorText: {
        color: '#A32D2D',
        fontSize: 13,
        marginBottom: 10,
    },
    btnPrimary: {
        backgroundColor: '#534AB7',
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
    },
    btnDisabled: {
        opacity: 0.6,
    },
    btnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    btnSecondary: {
        borderWidth: 1.5,
        borderColor: '#534AB7',
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
    },
    btnSecondaryText: {
        color: '#534AB7',
        fontWeight: '600',
        fontSize: 15,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#D3D1C7',
    },
    dividerText: {
        color: '#888780',
        fontSize: 14,
        marginHorizontal: 12,
    },
    authRow: {
        marginTop: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    authText: {
        color: '#5F5E5A',
        fontSize: 12,
        flex: 1,
        marginRight: 10,
    },
    authLink: {
        color: '#534AB7',
        fontWeight: '600',
    },
});
