import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useAuthStore } from '../src/presentation/viewmodels/useAuthViewModel';

export default function RootLayout() {
    const initAuth = useAuthStore((s) => s.init);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    return (
        <>
            <StatusBar style="dark" />
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: '#fff' },
                    headerTintColor: '#2C2C2A',
                    headerTitleStyle: { fontWeight: '600' },
                    contentStyle: { backgroundColor: '#F1EFE8' },
                }}
            >
                <Stack.Screen name="index" options={{ title: 'GiftRegistry' }} />
                <Stack.Screen name="list/[shareCode]" options={{ title: 'Lista de regalos' }} />
                <Stack.Screen name="create" options={{ title: 'Nueva lista' }} />
                <Stack.Screen name="login" options={{ title: 'Iniciar sesión' }} />
                <Stack.Screen name="register" options={{ title: 'Crear cuenta' }} />
            </Stack>
        </>
    );
}
