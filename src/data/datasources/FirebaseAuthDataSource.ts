import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    User,
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { User as DomainUser } from '../../domain/entities/User';

export class FirebaseAuthDataSource {

    async registerWithEmail(email: string, password: string): Promise<DomainUser> {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            return this.mapFirebaseUserToDomain(userCredential.user);
        } catch (error: any) {
            throw this.mapAuthError(error.code);
        }
    }

    async loginWithEmail(email: string, password: string): Promise<DomainUser> {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return this.mapFirebaseUserToDomain(userCredential.user);
        } catch (error: any) {
            throw this.mapAuthError(error.code);
        }
    }

    async loginWithGoogle(): Promise<DomainUser> {
        try {
            const provider = new GoogleAuthProvider();

            throw new Error('Usar signInWithGoogleRedirect en React Native');
        } catch (error: any) {
            throw this.mapAuthError(error.code || 'unknown-error');
        }
    }

    async signInWithGoogleRedirect(): Promise<void> {
        try {
            const provider = new GoogleAuthProvider();

            await signInWithRedirect(auth, provider);
        } catch (error: any) {
            throw this.mapAuthError(error.code || 'unknown-error');
        }
    }

    async getRedirectResultGoogle(): Promise<DomainUser | null> {
        try {
            const result = await getRedirectResult(auth);
            return result ? this.mapFirebaseUserToDomain(result.user) : null;
        } catch (error: any) {
            throw this.mapAuthError(error.code || 'unknown-error');
        }
    }

    async logout(): Promise<void> {
        try {
            await signOut(auth);
        } catch (error: any) {
            throw new Error(`Error al hacer logout: ${error.message}`);
        }
    }

    getCurrentUser(): DomainUser | null {
        const user = auth.currentUser;
        return user ? this.mapFirebaseUserToDomain(user) : null;
    }

    onAuthStateChanged(callback: (user: DomainUser | null) => void): () => void {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            const domainUser = firebaseUser ? this.mapFirebaseUserToDomain(firebaseUser) : null;
            callback(domainUser);
        });

        return unsubscribe;
    }

    private mapFirebaseUserToDomain(firebaseUser: User): DomainUser {
        return {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            // name viene de displayName en Firebase
            name: firebaseUser.displayName || 'Usuario',
            // photoUrl puede ser null, convertir a undefined
            photoUrl: firebaseUser.photoURL || undefined,
        } as DomainUser;
    }

    private mapAuthError(code: string): Error {
        const errorMessages: Record<string, string> = {
            'auth/email-already-in-use': 'Este email ya está registrado',
            'auth/invalid-email': 'Email inválido',
            'auth/operation-not-allowed': 'Operación no permitida',
            'auth/weak-password': 'La contraseña es muy débil (mín 6 caracteres)',
            'auth/user-disabled': 'Este usuario ha sido deshabilitado',
            'auth/user-not-found': 'Usuario no encontrado',
            'auth/wrong-password': 'Contraseña incorrecta',
            'auth/invalid-credential': 'Credenciales inválidas',
            'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
            'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
        };

        const message = errorMessages[code] || `Error de autenticación: ${code}`;
        return new Error(message);
    }
}
