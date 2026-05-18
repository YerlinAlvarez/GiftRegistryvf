import { User } from '../entities/User';

export interface IAuthRepository {
    registerUser(email: string, password: string): Promise<User>;
    loginUser(email: string, password: string): Promise<User>;
    loginWithGoogle(): Promise<User>;
    logoutUser(): Promise<void>;
    getCurrentUser(): User | null;
    subscribeToAuthState(callback: (user: User | null) => void): () => void;
}
