import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

import { auth } from '../../../config/firebase';
import { User as DomainUser } from '../../../domain/entities/User';

export class FirebaseAuthDataSourceBase {
  async registerWithEmail(
    email: string,
    password: string
  ): Promise<DomainUser> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    return this.mapFirebaseUserToDomain(userCredential.user);
  }

  async loginWithEmail(
    email: string,
    password: string
  ): Promise<DomainUser> {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return this.mapFirebaseUserToDomain(userCredential.user);
  }

  async loginWithGoogle(): Promise<DomainUser> {
    throw new Error('Implementado en web/native');
  }

  async loginWithGitHub(): Promise<DomainUser> {
    throw new Error('Implementado en web/native');
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  getCurrentUser(): DomainUser | null {
    const user = auth.currentUser;
    return user ? this.mapFirebaseUserToDomain(user) : null;
  }

  onAuthStateChanged(
    callback: (user: DomainUser | null) => void
  ): () => void {
    return onAuthStateChanged(auth, (firebaseUser) => {
      callback(
        firebaseUser
          ? this.mapFirebaseUserToDomain(firebaseUser)
          : null
      );
    });
  }

  protected mapFirebaseUserToDomain(
    firebaseUser: User
  ): DomainUser {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || 'Usuario',
      photoUrl: firebaseUser.photoURL || undefined,
    };
  }
}