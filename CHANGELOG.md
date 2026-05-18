# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

## [1.0.0] - 2026-04-08

### Added
- Email/password authentication (organizer).
- Gift list creation with share code.
- Gift items CRUD for organizer (add/edit/delete).
- Real-time updates via Firestore listeners.
- Concurrency control for reservations using Firestore transactions.
- Basic local cache for mobile using SQLite (best-effort/offline read).
- Firestore security rules (`firestore.rules`).

### Changed
- Firebase config reads `EXPO_PUBLIC_FIREBASE_*` variables (Expo Go friendly).
- UI components adjusted for broader Expo Go compatibility (avoid `gap` / `Intl`).

### Fixed
- Typed routes issues and missing exports in `app/` screens.
- Expo Router navigation consistency for auth + list flows.

### Known Issues
- Android native build may require local SDK setup (Build Tools / JAVA_HOME) depending on environment.
