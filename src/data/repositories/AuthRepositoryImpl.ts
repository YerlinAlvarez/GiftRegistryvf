import { FirebaseAuthDataSource } from '../datasources/auth';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { User } from '../../domain/entities/User';

export class AuthRepositoryImpl implements IAuthRepository {
    private dataSource: FirebaseAuthDataSource;

    constructor(dataSource: FirebaseAuthDataSource = new FirebaseAuthDataSource()) {
        this.dataSource = dataSource;
    }

    async registerUser(email: string, password: string): Promise<User> {
        return this.dataSource.registerWithEmail(email, password);
    }

    async loginUser(email: string, password: string): Promise<User> {
        return this.dataSource.loginWithEmail(email, password);
    }

    async loginWithGoogle(): Promise<User> {
        throw new Error(
            'Usar expo-auth-session para Google Sign-In en React Native. Ver useGoogleAuth hook.',
        );
    }

    async logoutUser(): Promise<void> {
        return this.dataSource.logout();
    }

    getCurrentUser(): User | null {
        return this.dataSource.getCurrentUser();
    }

    subscribeToAuthState(callback: (user: User | null) => void): () => void {
        return this.dataSource.onAuthStateChanged(callback);
    }
}
