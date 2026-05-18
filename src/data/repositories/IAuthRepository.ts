import { User } from '../../domain/entities/User';

export interface IAuthRepository {
    signInWithEmail(email: string, password: string): Promise<User>;
    signInWithGoogle(): Promise<User>;
    signOut(): Promise<void>;
    getCurrentUser(): User | null;
    onAuthStateChanged(callback: (user: User | null) => void): () => void;
}
