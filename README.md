# 🎁 GiftRegistry App

Lista de regalos para Baby Shower con actualización en tiempo real usando Firebase, React Native y Expo.

## 🎯 Características

- ✅ **Autenticación Firebase** - Email/Password (organizador)
- ✅ **Transacciones Atómicas** - Evita que dos usuarios regalen lo mismo
- ✅ **Real-time Updates** - Cambios se reflejan instantáneamente
- ✅ **Clean Architecture** - Código escalable y testeable
- ✅ **TypeScript Estricto** - 0 errores de tipos
- ✅ **State Management** - Zustand para estado global
- ✅ **Cache local (básico)** - SQLite (mobile) para abrir sin internet

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Mobile | React Native + Expo |
| Backend | Firebase (Firestore + Auth) |
| Estado | Zustand |
| Tipado | TypeScript |
| Navegación | Expo Router |

## 📋 Requisitos

- Node.js 18+
- pnpm (o npm)
- Expo Go app en tu móvil
- Cuenta Firebase

## 🚀 Quick Start

### 1. Instalar
```bash
cd /GiftRegistry
pnpm install
```

### 2. Configurar Firebase
Completa `.env` con tu Firebase Web config (`EXPO_PUBLIC_FIREBASE_*`). Ejemplo: `.env.example`.

### 3. Ejecutar
```bash
pnpm start
# Escanea QR en Expo Go
```

```bash
## 3.1 ejecucar en modo development
pnpm start --tunnel --clear
# Escanea QR en Expo Go
```

## 🏗️ Arquitectura

```
src/
├── domain/              # Entidades, interfaces, casos de uso
├── data/                # Implementación, datasources, mappers
└── presentation/        # Componentes, screens, viewmodels
```

**Clean Architecture:** Separación de capas, sin dependencias hacia arriba.

## 📱 Screens

- **HomeScreen** - Crear nueva lista o ingresar código
- **CreateScreen** - Crear lista de regalos
- **ListScreen** - Ver y gestionar regalos
- **LoginScreen** - Autenticación

## 🔑 Casos de Uso

1. **CreateGiftListUseCase** - Crear lista
2. **ReserveGiftUseCase** - Reservar (con transacción atómica)
3. **MarkAsBoughtUseCase** - Marcar comprado
4. **GetGiftListByShareCodeUseCase** - Cargar por código

## 🔐 Seguridad

- Firestore Rules implementadas
- Autenticación requerida
- Organizador solo puede editar su lista

## 📤 Deploy

Para producción:

1. Cambiar Firestore Rules a modo seguro
2. Usar Firebase Hosting (opcional)
3. Compilar con EAS Build

```bash
pnpm start
npx eas build --platform ios
npx eas build --platform android
```

## 🤝 Contribuir

Este es un proyecto académico. Para mejoras, abre un issue.

## 📝 Licencia

MIT

---

**Especial:** Implementé transacciones atómicas en Firebase para garantizar que dos usuarios no puedan regalar el mismo artículo simultáneamente. Esto fue el reto técnico principal.
