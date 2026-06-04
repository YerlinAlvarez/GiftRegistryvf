import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    GithubAuthProvider,
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
            const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
            
            if (isWeb) {
                const userCredential = await signInWithPopup(auth, provider);
                return this.mapFirebaseUserToDomain(userCredential.user);
            } else {
                await signInWithRedirect(auth, provider);
                const result = await getRedirectResult(auth);
                if (result) return this.mapFirebaseUserToDomain(result.user);
                throw new Error('No se pudo completar el login con Google');
            }
        } catch (error: any) {
            console.log('=== ERROR GOOGLE ===');
            console.log('error:', error);
            console.log('code:', error?.code);
            console.log('message:', error?.message);
            
            throw this.mapAuthError(error.code || 'unknown-error');
        }
    }


    async loginWithGitHub(): Promise<DomainUser> {
        try {
            const provider = new GithubAuthProvider();
            const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
            if (isWeb) {
                const userCredential = await signInWithPopup(auth, provider);
                return this.mapFirebaseUserToDomain(userCredential.user);
            } else {
                await signInWithRedirect(auth, provider);
                const result = await getRedirectResult(auth);
                if (result) return this.mapFirebaseUserToDomain(result.user);
                throw new Error('No se pudo completar el login con GitHub');
            }
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
            name: firebaseUser.displayName || 'Usuario',
            photoUrl: firebaseUser.photoURL || undefined,
        } as DomainUser;
    }

    private mapAuthError(code: string): Error {
        const errorMessages: Record<string, string> = {
            'auth/email-already-in-use': 'Este email ya esta registrado',
            'auth/invalid-email': 'Email invalido',
            'auth/weak-password': 'La contrasena es muy debil (min 6 caracteres)',
            'auth/user-not-found': 'Usuario no encontrado',
            'auth/wrong-password': 'Contrasena incorrecta',
            'auth/invalid-credential': 'Credenciales invalidas',
            'auth/too-many-requests': 'Demasiados intentos. Intenta mas tarde',
            'auth/network-request-failed': 'Error de conexion. Verifica tu internet',
            'auth/popup-closed-by-user': 'Cerraste la ventana de autenticacion',
            'auth/cancelled-popup-request': 'Autenticacion cancelada',
        };
        const message = errorMessages[code] || `Error de autenticacion: ${code}`;
        return new Error(message);
    }
}
